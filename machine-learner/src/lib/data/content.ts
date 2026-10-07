import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/db";
import type { SkillNodeData } from "@/types/domain";

/** Tag commun à tout le contenu pédagogique (invalidé après un seed). */
export const CONTENT_CACHE_TAG = "content";

export interface LessonData {
  id: string;
  order: number;
  title: string;
  youtubeUrl: string;
}

export interface SkillNodeDetail extends SkillNodeData {
  markdownPath: string | null;
  lessons: LessonData[]; // triées par `order` croissant
}

export interface QuestionBankItem {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number; // index dans `options` (ordre d'origine)
  explanation: string;
}

const NODE_ID_PATTERN = /^(BUT|ING)-[A-Z0-9]{2,8}$/;

/** Format des ids de nœuds ("BUT-ALG1", "ING-IA2"…) : filtre les paramètres d'URL avant toute requête et toute clé de cache. */
export function isValidNodeId(value: string): boolean {
  return NODE_ID_PATTERN.test(value);
}

/** Tous les nœuds du Skill Tree (champs utiles à la logique), triés par id. Contenu statique en cache. */
export async function getSkillNodes(): Promise<SkillNodeData[]> {
  "use cache";
  cacheTag(CONTENT_CACHE_TAG);
  cacheLife("max");

  return prisma.skillNode.findMany({
    select: {
      id: true,
      title: true,
      category: true,
      domain: true,
      description: true,
      prerequisites: true,
    },
    orderBy: { id: "asc" },
  });
}

/** Nœud et ses leçons, ou null si l'id est mal formé ou inconnu. */
export async function getSkillNodeDetail(nodeId: string): Promise<SkillNodeDetail | null> {
  if (!isValidNodeId(nodeId)) return null;
  return getCachedSkillNodeDetail(nodeId);
}

async function getCachedSkillNodeDetail(nodeId: string): Promise<SkillNodeDetail | null> {
  "use cache";
  cacheTag(CONTENT_CACHE_TAG);
  cacheLife("max");

  return prisma.skillNode.findUnique({
    where: { id: nodeId },
    select: {
      id: true,
      title: true,
      category: true,
      domain: true,
      description: true,
      prerequisites: true,
      markdownPath: true,
      lessons: {
        select: { id: true, order: true, title: true, youtubeUrl: true },
        orderBy: { order: "asc" },
      },
    },
  });
}

/**
 * Banque de questions d'un nœud (vide si l'id est mal formé ou inconnu).
 * CONTIENT LES BONNES RÉPONSES : USAGE EXCLUSIVEMENT SERVEUR (SERVER ACTIONS DU QUIZ, ÉTAPE 16).
 * NE JAMAIS TRANSMETTRE À UN CLIENT COMPONENT.
 */
export async function getQuestionBank(nodeId: string): Promise<QuestionBankItem[]> {
  if (!isValidNodeId(nodeId)) return [];
  return getCachedQuestionBank(nodeId);
}

async function getCachedQuestionBank(nodeId: string): Promise<QuestionBankItem[]> {
  "use cache";
  cacheTag(CONTENT_CACHE_TAG);
  cacheLife("max");

  return prisma.quizQuestion.findMany({
    where: { nodeId },
    select: {
      id: true,
      question: true,
      options: true,
      correctOptionIndex: true,
      explanation: true,
    },
    orderBy: { id: "asc" },
  });
}
