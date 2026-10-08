import { describe, expect, it } from "vitest";
import { type ReviewCandidate, isNewCard, selectReviewQueue, summarizeDue } from "./queue";

const NOW = new Date(2026, 0, 15, 10, 0);
const YESTERDAY = new Date(2026, 0, 14, 10, 0);
const TONIGHT = new Date(2026, 0, 15, 23, 0);
const TOMORROW = new Date(2026, 0, 16, 8, 0);

function cardId(index: number, nodeId = "BUT-MAT1"): string {
  return `${nodeId}-F${String(index).padStart(2, "0")}`;
}

function review(id: string, dueDate: Date, nodeId = "BUT-MAT1"): ReviewCandidate {
  return { cardId: id, nodeId, dueDate };
}

function fresh(id: string, nodeId = "BUT-MAT1"): ReviewCandidate {
  return { cardId: id, nodeId, dueDate: null };
}

function ids(candidates: readonly ReviewCandidate[]): string[] {
  return candidates.map((candidate) => candidate.cardId);
}

describe("selectReviewQueue", () => {
  it("retient les cartes dues hier et ce soir, triées par échéance, et exclut celles de demain", () => {
    const queue = selectReviewQueue(
      [review("BUT-MAT1-F01", TOMORROW), review("BUT-MAT1-F02", TONIGHT), review("BUT-MAT1-F03", YESTERDAY)],
      NOW,
    );

    expect(ids(queue)).toEqual(["BUT-MAT1-F03", "BUT-MAT1-F02"]);
  });

  it("plafonne les nouvelles cartes à maxNew, dans l'ordre d'entrée, après les révisions", () => {
    const newCards = Array.from({ length: 15 }, (_, i) => fresh(cardId(i + 1, "BUT-ALG1")));
    const reviews = [review("BUT-MAT1-F01", YESTERDAY), review("BUT-MAT1-F02", TONIGHT)];

    const queue = selectReviewQueue([...newCards, ...reviews], NOW, { maxNew: 10 });

    expect(queue).toHaveLength(12);
    expect(ids(queue.slice(0, 2))).toEqual(["BUT-MAT1-F01", "BUT-MAT1-F02"]);
    expect(ids(queue.slice(2))).toEqual(ids(newCards.slice(0, 10)));
    expect(queue.slice(2).every(isNewCard)).toBe(true);
  });

  it("tronque à limit : 18 révisions dues + 10 nouvelles avec limit = 20 → 18 révisions puis 2 nouvelles", () => {
    const reviews = Array.from({ length: 18 }, (_, i) => review(cardId(i + 1), YESTERDAY));
    const newCards = Array.from({ length: 10 }, (_, i) => fresh(cardId(i + 1, "BUT-ALG1")));

    const queue = selectReviewQueue([...newCards, ...reviews], NOW, { limit: 20 });

    expect(queue).toHaveLength(20);
    expect(ids(queue.slice(0, 18))).toEqual(ids(reviews));
    expect(ids(queue.slice(18))).toEqual(["BUT-ALG1-F01", "BUT-ALG1-F02"]);
  });

  it("départage les échéances égales par cardId", () => {
    const queue = selectReviewQueue(
      [review("BUT-MAT1-F03", YESTERDAY), review("BUT-ALG1-F01", YESTERDAY), review("BUT-MAT1-F01", YESTERDAY)],
      NOW,
    );

    expect(ids(queue)).toEqual(["BUT-ALG1-F01", "BUT-MAT1-F01", "BUT-MAT1-F03"]);
  });

  it("renvoie une file vide pour une entrée vide", () => {
    expect(selectReviewQueue([], NOW)).toEqual([]);
  });

  it("rejette une limite ou un plafond invalide", () => {
    expect(() => selectReviewQueue([], NOW, { limit: -1 })).toThrow(RangeError);
    expect(() => selectReviewQueue([], NOW, { maxNew: 1.5 })).toThrow(RangeError);
  });
});

describe("summarizeDue", () => {
  const candidates: ReviewCandidate[] = [
    review("BUT-MAT1-F01", YESTERDAY),
    review("BUT-MAT1-F02", TONIGHT),
    review("BUT-MAT1-F03", NOW),
    review("BUT-MAT1-F04", TOMORROW),
    ...Array.from({ length: 12 }, (_, i) => fresh(cardId(i + 1, "BUT-ALG1"))),
  ];

  it("compte les révisions dues et plafonne les nouvelles cartes", () => {
    expect(summarizeDue(candidates, NOW)).toEqual({ reviewCount: 3, newCount: 10, total: 13 });
    expect(summarizeDue(candidates, NOW, { maxNew: 5 })).toEqual({ reviewCount: 3, newCount: 5, total: 8 });
  });

  it("renvoie des compteurs à 0 pour une entrée vide", () => {
    expect(summarizeDue([], NOW)).toEqual({ reviewCount: 0, newCount: 0, total: 0 });
  });
});

describe("immutabilité", () => {
  it("ne mute ni le tableau, ni les candidats, ni leurs dates", () => {
    const candidates: ReviewCandidate[] = [
      fresh("BUT-ALG1-F01"),
      review("BUT-MAT1-F02", TONIGHT),
      review("BUT-MAT1-F01", YESTERDAY),
      review("BUT-MAT1-F03", TOMORROW),
    ];
    const snapshot = structuredClone(candidates);
    const now = new Date(NOW.getTime());

    selectReviewQueue(candidates, now, { limit: 2, maxNew: 1 });
    summarizeDue(candidates, now, { maxNew: 0 });

    expect(candidates).toEqual(snapshot);
    expect(now.getTime()).toBe(NOW.getTime());
  });
});
