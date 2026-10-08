"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getQuestionBank, getSkillNodes, isValidNodeId } from "@/lib/data/content";
import { getNodeForUser } from "@/lib/data/progress";
import {
  createAttemptItems,
  drawQuestions,
  gradeAttempt,
  isPassingScore,
  isQuizAttemptItems,
  isValidAnswers,
  toPublicQuestions,
} from "@/lib/quiz/engine";
import { requireUser } from "@/lib/session";
import { calculateNodeStatuses, getNewlyUnlockedNodeIds } from "@/lib/skill-tree/graph";
import { QUIZ_QUESTION_COUNT } from "@/types/domain";
import {
  QUIZ_ATTEMPT_TTL_MS,
  QUIZ_ERROR_MESSAGES,
  REQUIRE_COURSE_BEFORE_ING_QUIZ,
  type QuizActionResult,
  type QuizErrorCode,
  type QuizResult,
  type QuizSession,
} from "@/types/quiz";

const ATTEMPT_ID_PATTERN = /^[a-z0-9]{1,64}$/;

function fail(error: QuizErrorCode): { ok: false; error: QuizErrorCode; message: string } {
  return { ok: false, error, message: QUIZ_ERROR_MESSAGES[error] };
}

/**
 * Ouvre une tentative de quiz sur un nœud pour l'utilisateur connecté.
 * Les questions tirées et l'ordre des options restent en base ; le client ne reçoit ni réponse ni explication.
 */
export async function startQuizAttempt(nodeId: string): Promise<QuizActionResult<QuizSession>> {
  if (typeof nodeId !== "string" || !isValidNodeId(nodeId)) return fail("INVALID_INPUT");

  const user = await requireUser();
  const data = await getNodeForUser(nodeId);
  if (!data) return fail("NODE_NOT_FOUND");
  if (data.status === "LOCKED") return fail("NODE_LOCKED");
  if (REQUIRE_COURSE_BEFORE_ING_QUIZ && data.node.category === "INGENIEUR_IA" && data.courseViewedAt === null) {
    return fail("COURSE_NOT_VIEWED");
  }

  const bank = await getQuestionBank(nodeId);
  if (bank.length < QUIZ_QUESTION_COUNT) return fail("NOT_ENOUGH_QUESTIONS");

  const items = createAttemptItems(drawQuestions(bank, QUIZ_QUESTION_COUNT));
  const itemsJson: Prisma.InputJsonValue = items;

  // Anti-triche : une seule tentative ouverte par nœud, la précédente est abandonnée.
  const [, attempt] = await prisma.$transaction([
    prisma.quizAttempt.deleteMany({ where: { userId: user.id, nodeId, submittedAt: null } }),
    prisma.quizAttempt.create({
      data: { userId: user.id, nodeId, items: itemsJson },
      select: { id: true, startedAt: true },
    }),
  ]);

  const bankById = new Map(bank.map((question) => [question.id, question]));
  return {
    ok: true,
    data: {
      attemptId: attempt.id,
      nodeId,
      questions: toPublicQuestions(items, bankById),
      expiresAt: new Date(attempt.startedAt.getTime() + QUIZ_ATTEMPT_TTL_MS).toISOString(),
    },
  };
}

/**
 * Corrige une tentative côté serveur (une seule soumission, 30 min maximum), met à jour la progression
 * et renvoie le détail de la correction ainsi que les nœuds débloqués par cette réussite.
 */
export async function submitQuizAttempt(
  attemptId: string,
  answers: (number | null)[],
): Promise<QuizActionResult<QuizResult>> {
  if (typeof attemptId !== "string" || !ATTEMPT_ID_PATTERN.test(attemptId)) return fail("INVALID_INPUT");

  const user = await requireUser();
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    select: { id: true, userId: true, nodeId: true, items: true, startedAt: true, submittedAt: true },
  });
  // Même réponse qu'une tentative inexistante : ne jamais révéler celles des autres utilisateurs.
  if (!attempt || attempt.userId !== user.id) return fail("ATTEMPT_NOT_FOUND");
  if (attempt.submittedAt !== null) return fail("ATTEMPT_ALREADY_SUBMITTED");
  if (Date.now() - attempt.startedAt.getTime() > QUIZ_ATTEMPT_TTL_MS) return fail("ATTEMPT_EXPIRED");

  const { items, nodeId } = attempt;
  if (!isQuizAttemptItems(items)) {
    throw new Error(`Tentative de quiz ${attempt.id} corrompue : items invalides`);
  }
  if (!isValidAnswers(answers, items)) return fail("INVALID_ANSWERS");

  const [bank, nodes, progressRows] = await Promise.all([
    getQuestionBank(nodeId),
    getSkillNodes(),
    prisma.nodeProgress.findMany({
      where: { userId: user.id },
      select: { nodeId: true, isCompleted: true, bestScore: true, completedAt: true },
    }),
  ]);

  const bankById = new Map(bank.map((question) => [question.id, question]));
  const { score, correctCount, total, results } = gradeAttempt(items, answers, bankById);
  const passed = isPassingScore(score);

  // Déblocage en cascade : statuts avant / après cette tentative.
  const previous = progressRows.find((row) => row.nodeId === nodeId);
  const isCompleted = (previous?.isCompleted ?? false) || passed;
  const bestScore = Math.max(previous?.bestScore ?? 0, score);
  const before = calculateNodeStatuses(nodes, progressRows);
  const after = calculateNodeStatuses(nodes, [
    ...progressRows.filter((row) => row.nodeId !== nodeId),
    { nodeId, isCompleted, bestScore },
  ]);
  const titleById = new Map(nodes.map((node) => [node.id, node.title]));
  const newlyUnlocked = getNewlyUnlockedNodeIds(before, after).map((id) => ({
    id,
    title: titleById.get(id) ?? id,
  }));

  const now = new Date();
  const completedAt = previous?.completedAt ?? (passed ? now : null);
  const submitted = await prisma.$transaction(async (tx) => {
    // Garde `submittedAt: null` : une double soumission concurrente ne met rien à jour.
    const { count } = await tx.quizAttempt.updateMany({
      where: { id: attempt.id, submittedAt: null },
      data: { answers: answers.map((answer) => answer ?? -1), score, passed, submittedAt: now },
    });
    if (count === 0) return false;

    await tx.nodeProgress.upsert({
      where: { userId_nodeId: { userId: user.id, nodeId } },
      create: { userId: user.id, nodeId, isCompleted, bestScore, completedAt },
      update: { isCompleted, bestScore, completedAt },
    });
    return true;
  });
  if (!submitted) return fail("ATTEMPT_ALREADY_SUBMITTED");

  if (passed) {
    // Invalide le cache serveur et le cache client : l'arbre et le dashboard reflètent immédiatement les déblocages.
    revalidatePath("/", "layout");
  }

  return {
    ok: true,
    data: {
      attemptId: attempt.id,
      nodeId,
      score,
      passed,
      correctCount,
      total,
      bestScore,
      results,
      newlyUnlocked,
    },
  };
}
