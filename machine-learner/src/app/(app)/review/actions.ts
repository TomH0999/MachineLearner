"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { calculateSM2, createInitialSm2State, isSm2Quality } from "@/lib/srs/sm2";

export type ReviewErrorCode = "INVALID_INPUT" | "CARD_NOT_FOUND" | "CARD_NOT_AVAILABLE";
export type ReviewActionResult =
  | { ok: true; data: { cardId: string; interval: number; nextDueDate: string } } // ISO
  | { ok: false; error: ReviewErrorCode; message: string };

const CARD_ID_PATTERN = /^(BUT|ING)-[A-Z0-9]{2,8}-F\d{2}$/;

const REVIEW_ERROR_MESSAGES: Record<ReviewErrorCode, string> = {
  INVALID_INPUT: "Requête invalide : recharge la page et réessaie.",
  CARD_NOT_FOUND: "Cette carte n'existe pas.",
  CARD_NOT_AVAILABLE: "Cette carte n'est pas encore disponible : ouvre d'abord le cours de son module ou valide son quiz.",
};

function fail(error: ReviewErrorCode): ReviewActionResult {
  return { ok: false, error, message: REVIEW_ERROR_MESSAGES[error] };
}

/**
 * Enregistre la révision d'une flashcard par l'utilisateur connecté (SM-2) et renvoie sa prochaine échéance.
 * Entrées non fiables : id et note validés, carte accessible seulement si le cours du nœud a été ouvert ou son quiz validé.
 * L'état SM-2 est créé à la première révision.
 */
export async function reviewFlashcard(cardId: string, quality: number): Promise<ReviewActionResult> {
  if (typeof cardId !== "string" || !CARD_ID_PATTERN.test(cardId) || !isSm2Quality(quality)) {
    return fail("INVALID_INPUT");
  }

  const user = await requireUser();
  const [card, state] = await Promise.all([
    prisma.flashcard.findUnique({ where: { id: cardId }, select: { nodeId: true } }),
    prisma.flashcardState.findUnique({
      where: { userId_cardId: { userId: user.id, cardId } },
      select: { interval: true, repetition: true, easeFactor: true },
    }),
  ]);
  if (!card) return fail("CARD_NOT_FOUND");

  const progress = await prisma.nodeProgress.findUnique({
    where: { userId_nodeId: { userId: user.id, nodeId: card.nodeId } },
    select: { courseViewedAt: true, isCompleted: true },
  });
  if (!progress || (progress.courseViewedAt === null && !progress.isCompleted)) return fail("CARD_NOT_AVAILABLE");

  const now = new Date();
  const next = calculateSM2(state ?? createInitialSm2State(), quality, now);
  const data = {
    interval: next.interval,
    repetition: next.repetition,
    easeFactor: next.easeFactor,
    dueDate: next.dueDate,
    lastReviewedAt: now,
  };
  await prisma.flashcardState.upsert({
    where: { userId_cardId: { userId: user.id, cardId } },
    create: { userId: user.id, cardId, ...data },
    update: data,
  });

  // Pas de revalidation : la session de révision est pilotée côté client, le dashboard relit à chaque navigation.
  return { ok: true, data: { cardId, interval: next.interval, nextDueDate: next.dueDate.toISOString() } };
}
