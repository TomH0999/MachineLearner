import "server-only";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { type DueSummary, type ReviewCandidate, isNewCard, selectReviewQueue, summarizeDue } from "@/lib/srs/queue";

export interface ReviewCard {
  cardId: string;
  nodeId: string;
  nodeTitle: string;
  front: string;
  back: string;
  isNew: boolean;
}

type CardDisplay = Omit<ReviewCard, "isNew">;

/**
 * Cartes éligibles de l'utilisateur : celles des nœuds dont il a ouvert le cours ou validé le quiz.
 * Une carte sans FlashcardState est « nouvelle » (dueDate null). Lecture seule : aucun état n'est créé ici.
 */
async function loadCandidates(
  userId: string,
): Promise<{ candidates: ReviewCandidate[]; cardsById: Map<string, CardDisplay> }> {
  const eligibleNodes = await prisma.nodeProgress.findMany({
    where: { userId, OR: [{ courseViewedAt: { not: null } }, { isCompleted: true }] },
    select: { nodeId: true },
  });
  if (eligibleNodes.length === 0) return { candidates: [], cardsById: new Map() };

  const nodeIds = eligibleNodes.map((row) => row.nodeId);
  // Les deux lectures sont indépendantes : un seul aller-retour vers Neon.
  const [cards, states] = await Promise.all([
    prisma.flashcard.findMany({
      where: { nodeId: { in: nodeIds } },
      select: { id: true, nodeId: true, front: true, back: true, node: { select: { title: true } } },
      orderBy: [{ nodeId: "asc" }, { id: "asc" }],
    }),
    prisma.flashcardState.findMany({
      where: { userId, card: { nodeId: { in: nodeIds } } },
      select: { cardId: true, dueDate: true },
    }),
  ]);

  const dueDateByCardId = new Map(states.map((state) => [state.cardId, state.dueDate]));
  const candidates: ReviewCandidate[] = [];
  const cardsById = new Map<string, CardDisplay>();
  for (const card of cards) {
    candidates.push({ cardId: card.id, nodeId: card.nodeId, dueDate: dueDateByCardId.get(card.id) ?? null });
    cardsById.set(card.id, {
      cardId: card.id,
      nodeId: card.nodeId,
      nodeTitle: card.node.title,
      front: card.front,
      back: card.back,
    });
  }
  return { candidates, cardsById };
}

/**
 * Prochaine session de révision de l'utilisateur connecté (révisions dues puis nouvelles cartes).
 * Lit la session : sous <Suspense>.
 */
export async function getReviewQueue(): Promise<ReviewCard[]> {
  const user = await requireUser();
  const { candidates, cardsById } = await loadCandidates(user.id);

  return selectReviewQueue(candidates, new Date()).map((candidate) => {
    const card = cardsById.get(candidate.cardId);
    if (!card) throw new Error(`Flashcard ${candidate.cardId} absente des données chargées`);
    return { ...card, isNew: isNewCard(candidate) };
  });
}

/**
 * Nombre de cartes à réviser aujourd'hui pour l'utilisateur connecté (dashboard).
 * Lit la session : sous <Suspense>.
 */
export async function getDueSummary(): Promise<DueSummary> {
  const user = await requireUser();
  const { candidates } = await loadCandidates(user.id);
  return summarizeDue(candidates, new Date());
}
