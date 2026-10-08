import { randomInt } from "node:crypto";
import type { QuestionBankItem } from "@/lib/data/content";
import { PASSING_SCORE } from "@/types/domain";
import type { PublicQuizQuestion, QuizAttemptItem, QuizQuestionResult } from "@/types/quiz";

/**
 * Moteur de quiz pur : tirage, mélange, validation et correction.
 * Aucun accès à la base ni à la session ; l'aléatoire est injectable pour les tests.
 */

/** Entier uniforme dans [0, maxExclusive). */
export type RandomInt = (maxExclusive: number) => number;

/** Générateur cryptographique par défaut : l'ordre des questions et des options ne doit pas être prévisible. */
export const secureRandomInt: RandomInt = (maxExclusive) => randomInt(maxExclusive);

// ─── Tirage et mélange ───

/** Fisher-Yates sur une copie : `items` n'est jamais modifié. */
export function shuffle<T>(items: readonly T[], rand: RandomInt = secureRandomInt): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** `count` éléments de positions distinctes, dans un ordre aléatoire. Lève une erreur si la banque est trop petite. */
export function drawQuestions<T>(bank: readonly T[], count: number, rand: RandomInt = secureRandomInt): T[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`Nombre de questions invalide : ${count}`);
  }
  if (bank.length < count) {
    throw new RangeError(`Banque insuffisante : ${bank.length} question(s) pour ${count} demandée(s)`);
  }

  // Fisher-Yates partiel : seules les `count` premières positions sont tirées.
  const pool = [...bank];
  for (let i = 0; i < count; i++) {
    const j = i + rand(pool.length - i);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

/** Un item par question, avec un ordre d'options mélangé (permutation de 0..options.length-1). */
export function createAttemptItems(
  questions: readonly QuestionBankItem[],
  rand: RandomInt = secureRandomInt,
): QuizAttemptItem[] {
  return questions.map((question) => ({
    questionId: question.id,
    optionOrder: shuffle(
      question.options.map((_, index) => index),
      rand,
    ),
  }));
}

// ─── Vue publique ───

/**
 * Question de la banque correspondant à l'item, ou undefined si elle a été retirée
 * ou si son nombre d'options a changé depuis le tirage (l'ordre mémorisé ne s'applique plus).
 */
function findMatchingQuestion(
  item: QuizAttemptItem,
  bankById: ReadonlyMap<string, QuestionBankItem>,
): QuestionBankItem | undefined {
  const question = bankById.get(item.questionId);
  return question && question.options.length === item.optionOrder.length ? question : undefined;
}

function reorderOptions(options: readonly string[], optionOrder: readonly number[]): string[] {
  return optionOrder.map((originalIndex) => options[originalIndex]);
}

/** Questions telles qu'envoyées au client : options dans l'ordre affiché, SANS correctOptionIndex NI explanation. */
export function toPublicQuestions(
  items: readonly QuizAttemptItem[],
  bankById: ReadonlyMap<string, QuestionBankItem>,
): PublicQuizQuestion[] {
  return items.map((item) => {
    const question = findMatchingQuestion(item, bankById);
    if (!question) {
      throw new Error(`Question ${item.questionId} absente de la banque ou modifiée depuis le tirage`);
    }
    // Champs recopiés un à un : jamais de spread d'un QuestionBankItem (il contient la réponse).
    return {
      id: question.id,
      question: question.question,
      options: reorderOptions(question.options, item.optionOrder),
    };
  });
}

// ─── Validation des données non fiables ───

/** Tableau non vide d'entiers distincts couvrant exactement 0..length-1. */
function isPermutation(value: unknown): value is number[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  const seen = new Set<number>();
  for (let i = 0; i < value.length; i++) {
    const entry: unknown = value[i];
    if (typeof entry !== "number" || !Number.isInteger(entry) || entry < 0 || entry >= value.length) return false;
    if (seen.has(entry)) return false;
    seen.add(entry);
  }
  return true;
}

/** Valide `QuizAttempt.items` relu depuis la base : tableau non vide, ids non vides et uniques, ordres valides. */
export function isQuizAttemptItems(value: unknown): value is QuizAttemptItem[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  const questionIds = new Set<string>();
  for (let i = 0; i < value.length; i++) {
    const item: unknown = value[i];
    if (typeof item !== "object" || item === null) return false;
    const { questionId, optionOrder } = item as Record<string, unknown>;
    if (typeof questionId !== "string" || questionId.length === 0 || questionIds.has(questionId)) return false;
    if (!isPermutation(optionOrder)) return false;
    questionIds.add(questionId);
  }
  return true;
}

/** Réponses envoyées par le client : une par item, null (sans réponse) ou index AFFICHÉ valide. */
export function isValidAnswers(answers: unknown, items: readonly QuizAttemptItem[]): answers is (number | null)[] {
  if (!Array.isArray(answers) || answers.length !== items.length) return false;
  // Parcours par index (et non answers.every) : un tableau à trous est rejeté.
  return items.every((item, index) => {
    const answer: unknown = answers[index];
    return (
      answer === null ||
      (typeof answer === "number" && Number.isInteger(answer) && answer >= 0 && answer < item.optionOrder.length)
    );
  });
}

// ─── Correction ───

export interface GradedAttempt {
  score: number; // 0..100
  correctCount: number;
  total: number;
  results: QuizQuestionResult[];
}

/**
 * Corrige une tentative. `answers` (validé par isValidAnswers) contient des index AFFICHÉS.
 * Une question retirée de la banque depuis le tirage est exclue du total ; lève une erreur s'il n'en reste aucune.
 */
export function gradeAttempt(
  items: readonly QuizAttemptItem[],
  answers: readonly (number | null)[],
  bankById: ReadonlyMap<string, QuestionBankItem>,
): GradedAttempt {
  if (answers.length !== items.length) {
    throw new RangeError(`${answers.length} réponse(s) pour ${items.length} question(s)`);
  }

  const results: QuizQuestionResult[] = [];
  items.forEach((item, index) => {
    const question = findMatchingQuestion(item, bankById);
    if (!question) return;

    const selectedIndex = answers[index];
    results.push({
      questionId: question.id,
      question: question.question,
      options: reorderOptions(question.options, item.optionOrder),
      selectedIndex,
      correctIndex: item.optionOrder.indexOf(question.correctOptionIndex),
      isCorrect: selectedIndex !== null && item.optionOrder[selectedIndex] === question.correctOptionIndex,
      explanation: question.explanation,
    });
  });

  const total = results.length;
  if (total === 0) {
    throw new Error("Aucune question de la tentative n'existe encore dans la banque");
  }
  const correctCount = results.filter((result) => result.isCorrect).length;
  return { score: Math.round((correctCount / total) * 100), correctCount, total, results };
}

/** Seuil de réussite inclus (80 % → réussi). */
export function isPassingScore(score: number): boolean {
  return score >= PASSING_SCORE;
}
