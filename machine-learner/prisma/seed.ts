import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { loadContent } from "@/lib/content/load";
import { SkillGraphError } from "@/lib/skill-tree/graph";
import { ContentValidationError, type NodeBank, type SeedNode } from "../content/schema";

/**
 * Seed idempotent du contenu pédagogique (`npm run db:seed`, relançable à volonté).
 * - Tout le contenu est validé AVANT la première écriture : un contenu invalide n'écrit rien.
 * - Seules les tables de contenu sont écrites (SkillNode, Lesson, QuizQuestion, Flashcard).
 *   User, Session, Account, Verification, NodeProgress, FlashcardState et QuizAttempt ne sont jamais touchées,
 *   sauf une exception : supprimer une flashcard retirée du contenu supprime en cascade ses FlashcardState.
 * - Un SkillNode n'est jamais supprimé (la progression y est rattachée en cascade).
 * Client dédié : src/lib/db.ts importe "server-only", qui lève une erreur hors de Next.
 */

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL est absente : vérifie le fichier .env");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

interface NodeSummary {
  lessons: number;
  questions: number;
  flashcards: number;
}

async function upsertNodes(nodes: readonly SeedNode[]): Promise<void> {
  await prisma.$transaction(
    nodes.map((node) => {
      const data = {
        title: node.title,
        category: node.category,
        domain: node.domain,
        description: node.description,
        prerequisites: [...node.prerequisites],
        markdownPath: node.markdownPath,
      };
      return prisma.skillNode.upsert({ where: { id: node.id }, create: { id: node.id, ...data }, update: data });
    }),
  );

  const orphans = await prisma.skillNode.findMany({
    where: { id: { notIn: nodes.map((node) => node.id) } },
    select: { id: true },
    orderBy: { id: "asc" },
  });
  if (orphans.length > 0) {
    console.warn(
      `⚠ ${orphans.length} nœud(s) en base absent(s) du contenu, conservé(s) : ${orphans.map((n) => n.id).join(", ")}`,
    );
  }
}

/** Les leçons ne sont référencées par aucune donnée utilisateur : on les remplace (réordonnancement sans conflit d'unicité). */
async function replaceLessons(node: SeedNode): Promise<void> {
  const data = node.lessons.map((lesson) => ({
    id: lesson.id,
    nodeId: node.id,
    order: lesson.order,
    title: lesson.title,
    youtubeUrl: lesson.youtubeUrl,
  }));
  await prisma.$transaction([
    prisma.lesson.deleteMany({ where: { nodeId: node.id } }),
    ...(data.length > 0 ? [prisma.lesson.createMany({ data })] : []),
  ]);
}

/**
 * Upserts des questions et cartes d'une banque, puis suppression de celles retirées du fichier.
 * Transaction en mode tableau (pas interactive) pour éviter le timeout de 5 s.
 * Les deleteMany sont placés en tête pour typer leurs compteurs ; leur filtre `notIn` exclut
 * les ids upsertés, donc l'ordre ne change rien au résultat.
 */
async function syncBank(bank: NodeBank): Promise<{ deletedQuestions: number; deletedFlashcards: number }> {
  const { nodeId } = bank;
  const questionIds = bank.questions.map((question) => question.id);
  const flashcardIds = bank.flashcards.map((card) => card.id);

  const [deletedQuestions, deletedFlashcards] = await prisma.$transaction([
    prisma.quizQuestion.deleteMany({ where: { nodeId, id: { notIn: questionIds } } }),
    prisma.flashcard.deleteMany({ where: { nodeId, id: { notIn: flashcardIds } } }),
    ...bank.questions.map(({ id, ...question }) => {
      const data = { ...question, nodeId };
      return prisma.quizQuestion.upsert({ where: { id }, create: { id, ...data }, update: data });
    }),
    ...bank.flashcards.map(({ id, ...card }) => {
      const data = { ...card, nodeId };
      return prisma.flashcard.upsert({ where: { id }, create: { id, ...data }, update: data });
    }),
  ]);

  return { deletedQuestions: deletedQuestions.count, deletedFlashcards: deletedFlashcards.count };
}

async function main(): Promise<void> {
  const startedAt = performance.now();

  // 0. Validation complète avant toute écriture.
  let content: Awaited<ReturnType<typeof loadContent>>;
  try {
    content = await loadContent();
  } catch (error) {
    if (error instanceof SkillGraphError || error instanceof ContentValidationError) {
      console.error(`✖ Contenu invalide, aucune écriture en base.\n${error.message}`);
      process.exitCode = 1;
      return;
    }
    throw error;
  }
  const { nodes, banks } = content;

  // 1. Nœuds.
  await upsertNodes(nodes);

  // 2. Leçons.
  const summary = new Map<string, NodeSummary>(
    nodes.map((node) => [node.id, { lessons: 0, questions: 0, flashcards: 0 }]),
  );
  for (const node of nodes) {
    await replaceLessons(node);
    summary.get(node.id)!.lessons = node.lessons.length;
  }

  // 3. Banques (les nœuds sans fichier de banque ne sont pas touchés).
  for (const bank of banks) {
    const { deletedQuestions, deletedFlashcards } = await syncBank(bank);
    if (deletedQuestions > 0) {
      console.warn(`⚠ ${bank.nodeId} : ${deletedQuestions} question(s) retirée(s) du contenu supprimée(s).`);
    }
    if (deletedFlashcards > 0) {
      console.warn(
        `⚠ ${bank.nodeId} : ${deletedFlashcards} carte(s) retirée(s) du contenu supprimée(s), ` +
          "ainsi que leurs états de révision (FlashcardState).",
      );
    }
    const nodeSummary = summary.get(bank.nodeId)!;
    nodeSummary.questions = bank.questions.length;
    nodeSummary.flashcards = bank.flashcards.length;
  }

  // 4. Résumé.
  const totals: NodeSummary = { lessons: 0, questions: 0, flashcards: 0 };
  for (const [nodeId, s] of summary) {
    totals.lessons += s.lessons;
    totals.questions += s.questions;
    totals.flashcards += s.flashcards;
    if (s.lessons + s.questions + s.flashcards > 0) {
      console.log(`${nodeId} : ${s.lessons} leçon(s), ${s.questions} question(s), ${s.flashcards} carte(s)`);
    }
  }
  const seconds = ((performance.now() - startedAt) / 1000).toFixed(1);
  console.log(
    `✔ Seed terminé : ${nodes.length} nœud(s), ${totals.lessons} leçon(s), ` +
      `${totals.questions} question(s), ${totals.flashcards} carte(s) en ${seconds} s.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("✖ Échec du seed :", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
