/**
 * File de révision « à la Anki » : cartes à réviser dues d'abord, puis nouvelles cartes plafonnées.
 * Fonctions pures (pas de base, pas de session, `now` injecté) ; les entrées ne sont jamais mutées.
 */
import { isDue } from "./sm2";

export const REVIEW_SESSION_LIMIT = 20;
export const NEW_CARDS_PER_SESSION = 10;

export interface ReviewCandidate {
  cardId: string;
  nodeId: string;
  dueDate: Date | null; // null = nouvelle carte (aucun FlashcardState)
}

export interface DueSummary {
  reviewCount: number;
  newCount: number;
  total: number;
}

export interface ReviewQueueOptions {
  limit?: number;
  maxNew?: number;
}

type ScheduledCandidate = ReviewCandidate & { dueDate: Date };

/** Vrai si la carte n'a jamais été révisée. */
export function isNewCard(candidate: ReviewCandidate): boolean {
  return candidate.dueDate === null;
}

function isDueReview(candidate: ReviewCandidate, now: Date): candidate is ScheduledCandidate {
  return candidate.dueDate !== null && isDue(candidate.dueDate, now);
}

function compareByDueDateThenId(a: ScheduledCandidate, b: ScheduledCandidate): number {
  const byDate = a.dueDate.getTime() - b.dueDate.getTime();
  if (byDate !== 0) return byDate;
  if (a.cardId === b.cardId) return 0;
  return a.cardId < b.cardId ? -1 : 1; // ordre binaire : indépendant de la locale
}

function assertCount(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`File de révision : ${name} invalide (${value}), entier ≥ 0 attendu`);
  }
}

/**
 * Cartes de la prochaine session : révisions dues aujourd'hui (dueDate ≤ fin de journée de `now`) par échéance
 * croissante puis cardId, suivies d'au plus `maxNew` nouvelles cartes dans l'ordre d'entrée, le tout tronqué à `limit`.
 * Les cartes à échéance future sont exclues.
 */
export function selectReviewQueue(
  candidates: readonly ReviewCandidate[],
  now: Date,
  { limit = REVIEW_SESSION_LIMIT, maxNew = NEW_CARDS_PER_SESSION }: ReviewQueueOptions = {},
): ReviewCandidate[] {
  assertCount("limit", limit);
  assertCount("maxNew", maxNew);

  const reviews = candidates.filter((candidate) => isDueReview(candidate, now)).sort(compareByDueDateThenId);
  const newCards = candidates.filter(isNewCard).slice(0, maxNew);
  return [...reviews, ...newCards].slice(0, limit);
}

/** Compteurs pour le dashboard : révisions dues aujourd'hui et nouvelles cartes plafonnées à `maxNew`. */
export function summarizeDue(
  candidates: readonly ReviewCandidate[],
  now: Date,
  { maxNew = NEW_CARDS_PER_SESSION }: Pick<ReviewQueueOptions, "maxNew"> = {},
): DueSummary {
  assertCount("maxNew", maxNew);

  const reviewCount = candidates.filter((candidate) => isDueReview(candidate, now)).length;
  const newCount = Math.min(candidates.filter(isNewCard).length, maxNew);
  return { reviewCount, newCount, total: reviewCount + newCount };
}
