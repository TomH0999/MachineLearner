import { describe, expect, it } from "vitest";
import type { QuestionBankItem } from "@/lib/data/content";
import type { QuizAttemptItem } from "@/types/quiz";
import {
  type RandomInt,
  createAttemptItems,
  drawQuestions,
  gradeAttempt,
  isPassingScore,
  isQuizAttemptItems,
  isValidAnswers,
  secureRandomInt,
  shuffle,
  toPublicQuestions,
} from "./engine";

/** Petit LCG déterministe (constantes de Numerical Recipes). */
function createLcg(seed: number): RandomInt {
  let state = seed >>> 0;
  return (maxExclusive) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % maxExclusive;
  };
}

function question(id: string, correctOptionIndex: number, optionCount = 4): QuestionBankItem {
  return {
    id,
    question: `Énoncé ${id}`,
    options: Array.from({ length: optionCount }, (_, index) => `${id}-option-${index}`),
    correctOptionIndex,
    explanation: `Explication ${id}`,
  };
}

const BANK: QuestionBankItem[] = [
  question("Q1", 0),
  question("Q2", 1),
  question("Q3", 2),
  question("Q4", 3),
  question("Q5", 1),
];
const BANK_BY_ID: ReadonlyMap<string, QuestionBankItem> = new Map(BANK.map((item) => [item.id, item]));

/** Ordres d'options fixes (optionOrder[indexAffiché] = indexOrigine). */
const ITEMS: QuizAttemptItem[] = [
  { questionId: "Q1", optionOrder: [2, 0, 3, 1] }, // bonne réponse (0) affichée en 1
  { questionId: "Q2", optionOrder: [1, 2, 3, 0] }, // bonne réponse (1) affichée en 0
  { questionId: "Q3", optionOrder: [3, 1, 0, 2] }, // bonne réponse (2) affichée en 3
  { questionId: "Q4", optionOrder: [0, 3, 2, 1] }, // bonne réponse (3) affichée en 1
  { questionId: "Q5", optionOrder: [3, 2, 1, 0] }, // bonne réponse (1) affichée en 2
];
const CORRECT_DISPLAYED = [1, 0, 3, 1, 2];

/** Réponse affichée fausse : la suivante, modulo 4. */
function wrong(displayedCorrect: number): number {
  return (displayedCorrect + 1) % 4;
}

function sorted(values: readonly number[]): number[] {
  return [...values].sort((a, b) => a - b);
}

describe("shuffle", () => {
  it("renvoie une permutation (même multiset) sans muter l'entrée", () => {
    const input = [1, 2, 2, 3, 4, 5, 6];
    const snapshot = [...input];

    const result = shuffle(input, createLcg(42));

    expect(result).not.toBe(input);
    expect(input).toEqual(snapshot);
    expect(sorted(result)).toEqual(sorted(input));
  });

  it("est déterministe avec un RNG injecté", () => {
    const input = Array.from({ length: 10 }, (_, index) => index);

    expect(shuffle(input, createLcg(7))).toEqual(shuffle(input, createLcg(7)));
  });

  it("RNG « j = i » → ordre conservé ; RNG « j = 0 » → ordre attendu", () => {
    expect(shuffle(["a", "b", "c", "d"], (max) => max - 1)).toEqual(["a", "b", "c", "d"]);
    expect(shuffle(["a", "b", "c", "d"], () => 0)).toEqual(["b", "c", "d", "a"]);
  });

  it("avec secureRandomInt, 50 mélanges de 4 éléments donnent au moins 2 ordres distincts", () => {
    const orders = new Set<string>();
    for (let i = 0; i < 50; i++) orders.add(shuffle([0, 1, 2, 3], secureRandomInt).join(","));

    expect(orders.size).toBeGreaterThanOrEqual(2);
  });
});

describe("drawQuestions", () => {
  const ten = Array.from({ length: 10 }, (_, index) => `Q${index}`);

  it("tire 5 éléments distincts parmi 10", () => {
    for (const rand of [createLcg(1), createLcg(99), secureRandomInt]) {
      const drawn = drawQuestions(ten, 5, rand);

      expect(drawn).toHaveLength(5);
      expect(new Set(drawn).size).toBe(5);
      for (const id of drawn) expect(ten).toContain(id);
    }
  });

  it("ne mute pas la banque", () => {
    const snapshot = [...ten];
    drawQuestions(ten, 5, createLcg(3));

    expect(ten).toEqual(snapshot);
  });

  it("lève une erreur si la banque contient moins de 5 éléments", () => {
    expect(() => drawQuestions(["Q1", "Q2", "Q3", "Q4"], 5)).toThrow();
  });
});

describe("createAttemptItems", () => {
  it("associe chaque question à une permutation complète de ses options", () => {
    const bank = [question("A", 0, 2), question("B", 1, 4), question("C", 2, 6)];

    const items = createAttemptItems(bank, createLcg(5));

    expect(items.map((item) => item.questionId)).toEqual(["A", "B", "C"]);
    items.forEach((item, index) => {
      const optionCount = bank[index].options.length;
      expect(sorted(item.optionOrder)).toEqual(Array.from({ length: optionCount }, (_, i) => i));
    });
    expect(isQuizAttemptItems(items)).toBe(true);
  });
});

describe("toPublicQuestions", () => {
  it("réordonne les options selon optionOrder", () => {
    const [first] = toPublicQuestions(ITEMS, BANK_BY_ID);

    expect(first.options).toEqual(["Q1-option-2", "Q1-option-0", "Q1-option-3", "Q1-option-1"]);
  });

  it("n'expose que id, question et options (ni réponse ni explication)", () => {
    for (const publicQuestion of toPublicQuestions(ITEMS, BANK_BY_ID)) {
      expect(Object.keys(publicQuestion)).toEqual(["id", "question", "options"]);
    }
  });

  it("lève une erreur si une question a disparu de la banque", () => {
    expect(() => toPublicQuestions([{ questionId: "INCONNUE", optionOrder: [0, 1] }], BANK_BY_ID)).toThrow();
  });
});

describe("gradeAttempt", () => {
  it("5/5 → 100, réussite", () => {
    const graded = gradeAttempt(ITEMS, CORRECT_DISPLAYED, BANK_BY_ID);

    expect(graded).toMatchObject({ score: 100, correctCount: 5, total: 5 });
    expect(isPassingScore(graded.score)).toBe(true);
  });

  it("4/5 → 80, réussite (seuil inclus)", () => {
    const answers = [...CORRECT_DISPLAYED];
    answers[4] = wrong(answers[4]);

    const graded = gradeAttempt(ITEMS, answers, BANK_BY_ID);

    expect(graded).toMatchObject({ score: 80, correctCount: 4, total: 5 });
    expect(isPassingScore(graded.score)).toBe(true);
  });

  it("3/5 → 60, échec", () => {
    const answers = [...CORRECT_DISPLAYED];
    answers[0] = wrong(answers[0]);
    answers[2] = wrong(answers[2]);

    const graded = gradeAttempt(ITEMS, answers, BANK_BY_ID);

    expect(graded).toMatchObject({ score: 60, correctCount: 3, total: 5 });
    expect(isPassingScore(graded.score)).toBe(false);
  });

  it("une réponse null compte comme fausse", () => {
    const answers: (number | null)[] = [...CORRECT_DISPLAYED];
    answers[1] = null;

    const graded = gradeAttempt(ITEMS, answers, BANK_BY_ID);

    expect(graded.correctCount).toBe(4);
    expect(graded.results[1]).toMatchObject({ selectedIndex: null, isCorrect: false });
  });

  it("correctIndex est l'index AFFICHÉ, pas l'index d'origine", () => {
    const graded = gradeAttempt(ITEMS, [null, null, null, null, null], BANK_BY_ID);

    expect(graded.results.map((result) => result.correctIndex)).toEqual(CORRECT_DISPLAYED);
    expect(graded.results[0].options[graded.results[0].correctIndex]).toBe("Q1-option-0");
    expect(graded.score).toBe(0);
  });

  it("répondre l'index d'ORIGINE de la bonne réponse ne suffit pas", () => {
    // Q1 : bonne réponse d'origine 0, affichée en 1 ; l'option affichée en 0 est l'origine 2.
    const graded = gradeAttempt([ITEMS[0]], [0], BANK_BY_ID);

    expect(graded.results[0].isCorrect).toBe(false);
  });

  it("exclut du total une question absente de la banque", () => {
    const bankWithoutQ3 = new Map([...BANK_BY_ID].filter(([id]) => id !== "Q3"));
    const answers = [...CORRECT_DISPLAYED];
    answers[0] = wrong(answers[0]);

    const graded = gradeAttempt(ITEMS, answers, bankWithoutQ3);

    expect(graded).toMatchObject({ total: 4, correctCount: 3, score: 75 });
    expect(graded.results.map((result) => result.questionId)).toEqual(["Q1", "Q2", "Q4", "Q5"]);
  });

  it("lève une erreur si aucune question n'existe plus dans la banque", () => {
    expect(() => gradeAttempt(ITEMS, CORRECT_DISPLAYED, new Map())).toThrow();
  });
});

describe("isValidAnswers", () => {
  it("accepte une réponse par question, null compris", () => {
    expect(isValidAnswers([1, null, 3, 0, 2], ITEMS)).toBe(true);
  });

  it("rejette une longueur différente", () => {
    expect(isValidAnswers([1, 0, 3, 1], ITEMS)).toBe(false);
    expect(isValidAnswers([1, 0, 3, 1, 2, 0], ITEMS)).toBe(false);
  });

  it("rejette un index hors bornes", () => {
    expect(isValidAnswers([1, 0, 3, 1, 4], ITEMS)).toBe(false);
    expect(isValidAnswers([-1, 0, 3, 1, 2], ITEMS)).toBe(false);
  });

  it("rejette un index non entier ou non numérique", () => {
    expect(isValidAnswers([1.5, 0, 3, 1, 2], ITEMS)).toBe(false);
    expect(isValidAnswers(["1", 0, 3, 1, 2], ITEMS)).toBe(false);
    expect(isValidAnswers([Number.NaN, 0, 3, 1, 2], ITEMS)).toBe(false);
    expect(isValidAnswers([undefined, 0, 3, 1, 2], ITEMS)).toBe(false);
  });

  it("rejette un non-tableau", () => {
    expect(isValidAnswers(null, ITEMS)).toBe(false);
    expect(isValidAnswers({ 0: 1, length: 5 }, ITEMS)).toBe(false);
    expect(isValidAnswers("10312", ITEMS)).toBe(false);
  });
});

describe("isQuizAttemptItems", () => {
  it("accepte une forme valide", () => {
    expect(isQuizAttemptItems(ITEMS)).toBe(true);
  });

  it("rejette un optionOrder qui n'est pas une permutation", () => {
    expect(isQuizAttemptItems([{ questionId: "Q1", optionOrder: [0, 0, 1, 2] }])).toBe(false);
    expect(isQuizAttemptItems([{ questionId: "Q1", optionOrder: [0, 1, 2, 4] }])).toBe(false);
    expect(isQuizAttemptItems([{ questionId: "Q1", optionOrder: [] }])).toBe(false);
    expect(isQuizAttemptItems([{ questionId: "Q1", optionOrder: "0123" }])).toBe(false);
  });

  it("rejette un id vide ou absent", () => {
    expect(isQuizAttemptItems([{ questionId: "", optionOrder: [0, 1] }])).toBe(false);
    expect(isQuizAttemptItems([{ optionOrder: [0, 1] }])).toBe(false);
  });

  it("rejette un non-tableau ou un tableau vide", () => {
    expect(isQuizAttemptItems(null)).toBe(false);
    expect(isQuizAttemptItems({ questionId: "Q1", optionOrder: [0, 1] })).toBe(false);
    expect(isQuizAttemptItems([])).toBe(false);
    expect(isQuizAttemptItems([null])).toBe(false);
  });
});
