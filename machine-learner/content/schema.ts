import type { SkillNodeData } from "@/types/domain";

export const SKILL_NODE_IDS = [
  "BUT-ALG1", "BUT-DEV1", "BUT-BDD1", "BUT-RES1", "BUT-WEB1", "BUT-MAT1",
  "ING-MAT2", "ING-MAT3", "ING-MAT4", "ING-ALG2", "ING-ALG3",
  "ING-IA1", "ING-IA2", "ING-ARCH1", "ING-ENG1",
] as const;
export type SkillNodeId = (typeof SKILL_NODE_IDS)[number];

export interface SeedLesson {
  id: string; // "{nodeId}-L01"
  order: number; // 1, 2, 3…
  title: string;
  youtubeUrl: string;
}

/** Nœud de content/skill-tree.ts : prérequis typés, donc une faute de frappe casse le typecheck. */
export interface SeedNode extends SkillNodeData {
  id: SkillNodeId;
  prerequisites: readonly SkillNodeId[];
  markdownPath: string; // "content/courses/{id}.md" (le fichier peut ne pas encore exister)
  lessons: readonly SeedLesson[];
}

export interface SeedQuestion {
  id: string; // "{nodeId}-Q01"
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface SeedFlashcard {
  id: string; // "{nodeId}-F01"
  front: string;
  back: string;
}

/** Contenu d'un fichier content/banks/{NODE}.json */
export interface NodeBank {
  nodeId: SkillNodeId;
  questions: SeedQuestion[];
  flashcards: SeedFlashcard[];
}

export class ContentValidationError extends Error {}

/** Il faut au moins 5 questions (QUIZ_QUESTION_COUNT) pour tirer un quiz. */
export const MIN_QUESTIONS_PER_BANK = 5;

const MIN_OPTIONS = 3;
const MAX_OPTIONS = 5;

/** watch?v=ID ou youtu.be/ID (ID YouTube = 11 caractères), paramètres optionnels (&t=…). */
const YOUTUBE_URL = /^https:\/\/(?:www\.youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}(?:[?&#]\S*)?$/;

const NODE_ID_SET: ReadonlySet<string> = new Set(SKILL_NODE_IDS);

export function isSkillNodeId(value: unknown): value is SkillNodeId {
  return typeof value === "string" && NODE_ID_SET.has(value);
}

/** Format des IDs de contenu : "{nodeId}-L01", "{nodeId}-Q01", "{nodeId}-F01". */
function contentIdPattern(nodeId: SkillNodeId, kind: "L" | "Q" | "F"): RegExp {
  return new RegExp(`^${nodeId}-${kind}\\d{2}$`);
}

/**
 * Contrôles locaux à chaque nœud (leçons, chemin de la fiche).
 * La cohérence du graphe (prérequis inconnus, cycles) relève d'assertValidSkillGraph.
 */
export function validateSeedNodes(nodes: readonly SeedNode[]): string[] {
  const errors: string[] = [];

  for (const node of nodes) {
    const expectedPath = `content/courses/${node.id}.md`;
    if (node.markdownPath !== expectedPath) {
      errors.push(`${node.id} : markdownPath « ${node.markdownPath} » invalide, « ${expectedPath} » attendu.`);
    }

    const lessonIdPattern = contentIdPattern(node.id, "L");
    const seenIds = new Set<string>();
    const seenOrders = new Set<number>();
    for (const lesson of node.lessons) {
      if (!lessonIdPattern.test(lesson.id)) {
        errors.push(`${node.id} : id de leçon « ${lesson.id} » invalide, format attendu ${node.id}-L01.`);
      } else if (seenIds.has(lesson.id)) {
        errors.push(`${node.id} : id de leçon « ${lesson.id} » en double.`);
      }
      seenIds.add(lesson.id);

      if (seenOrders.has(lesson.order)) {
        errors.push(`${node.id} : order ${lesson.order} utilisé par plusieurs leçons.`);
      }
      seenOrders.add(lesson.order);

      if (!YOUTUBE_URL.test(lesson.youtubeUrl)) {
        errors.push(
          `${lesson.id} : youtubeUrl « ${lesson.youtubeUrl} » invalide, ` +
            "https://www.youtube.com/watch?v=… ou https://youtu.be/… attendu.",
        );
      }
    }
  }

  return errors;
}

// ─── Lecture d'une banque JSON : toutes les erreurs sont collectées avant de lever ───

type UnknownRecord = Record<string, unknown>;
type IdReader = (value: unknown, at: string) => string | undefined;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(value: unknown, at: string, errors: string[]): string | undefined {
  if (typeof value === "string" && value.trim().length > 0) return value;
  errors.push(`${at} : chaîne non vide attendue.`);
  return undefined;
}

/** Contrôle le format "{nodeId}-{kind}NN" (si nodeId est valide) et l'unicité dans la banque. */
function createIdReader(nodeId: SkillNodeId | undefined, kind: "Q" | "F", errors: string[]): IdReader {
  const pattern = nodeId === undefined ? undefined : contentIdPattern(nodeId, kind);
  const seen = new Set<string>();
  return (value, at) => {
    const id = readText(value, at, errors);
    if (id === undefined) return undefined;
    const errorCount = errors.length;
    if (pattern && !pattern.test(id)) {
      errors.push(`${at} : « ${id} » ne respecte pas le format ${nodeId}-${kind}01.`);
    }
    if (seen.has(id)) errors.push(`${at} : « ${id} » est déjà utilisé.`);
    seen.add(id);
    return errors.length === errorCount ? id : undefined;
  };
}

function readList<T>(
  value: unknown,
  at: string,
  errors: string[],
  readItem: (item: unknown, at: string) => T | undefined,
): T[] | undefined {
  if (!Array.isArray(value)) {
    errors.push(`${at} : tableau attendu.`);
    return undefined;
  }
  const items: T[] = [];
  value.forEach((item: unknown, index) => {
    const parsed = readItem(item, `${at}[${index}]`);
    if (parsed !== undefined) items.push(parsed);
  });
  return items;
}

function readOptions(value: unknown, at: string, errors: string[]): string[] | undefined {
  if (!Array.isArray(value)) {
    errors.push(`${at} : tableau de ${MIN_OPTIONS} à ${MAX_OPTIONS} chaînes attendu.`);
    return undefined;
  }
  const errorCount = errors.length;
  if (value.length < MIN_OPTIONS || value.length > MAX_OPTIONS) {
    errors.push(`${at} : ${MIN_OPTIONS} à ${MAX_OPTIONS} options attendues, ${value.length} trouvée(s).`);
  }
  const options: string[] = [];
  const seen = new Set<string>();
  value.forEach((item: unknown, index) => {
    const option = readText(item, `${at}[${index}]`, errors);
    if (option === undefined) return;
    const key = option.trim();
    if (seen.has(key)) errors.push(`${at}[${index}] : option « ${key} » en double.`);
    seen.add(key);
    options.push(option);
  });
  return errors.length === errorCount ? options : undefined;
}

function readCorrectIndex(
  value: unknown,
  optionCount: number | undefined,
  at: string,
  errors: string[],
): number | undefined {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    errors.push(`${at} : entier attendu.`);
    return undefined;
  }
  if (optionCount === undefined) return undefined; // options illisibles : déjà signalé
  if (value < 0 || value >= optionCount) {
    errors.push(`${at} : ${value} hors bornes, valeur entre 0 et ${optionCount - 1} attendue.`);
    return undefined;
  }
  return value;
}

function readQuestion(raw: unknown, at: string, readId: IdReader, errors: string[]): SeedQuestion | undefined {
  if (!isRecord(raw)) {
    errors.push(`${at} : objet attendu.`);
    return undefined;
  }
  const id = readId(raw.id, `${at}.id`);
  const question = readText(raw.question, `${at}.question`, errors);
  const options = readOptions(raw.options, `${at}.options`, errors);
  const optionCount = Array.isArray(raw.options) ? raw.options.length : undefined;
  const correctOptionIndex = readCorrectIndex(raw.correctOptionIndex, optionCount, `${at}.correctOptionIndex`, errors);
  const explanation = readText(raw.explanation, `${at}.explanation`, errors);

  if (
    id === undefined ||
    question === undefined ||
    options === undefined ||
    correctOptionIndex === undefined ||
    explanation === undefined
  ) {
    return undefined;
  }
  return { id, question, options, correctOptionIndex, explanation };
}

function readFlashcard(raw: unknown, at: string, readId: IdReader, errors: string[]): SeedFlashcard | undefined {
  if (!isRecord(raw)) {
    errors.push(`${at} : objet attendu.`);
    return undefined;
  }
  const id = readId(raw.id, `${at}.id`);
  const front = readText(raw.front, `${at}.front`, errors);
  const back = readText(raw.back, `${at}.back`, errors);

  if (id === undefined || front === undefined || back === undefined) return undefined;
  return { id, front, back };
}

function bankError(source: string, errors: readonly string[]): ContentValidationError {
  const lines = errors.map((error) => `  - ${error}`);
  return new ContentValidationError([`${source} : ${errors.length} erreur(s) de contenu`, ...lines].join("\n"));
}

/** Valide le contenu brut d'un fichier content/banks/{NODE}.json ; `source` préfixe le message d'erreur. */
export function parseNodeBank(raw: unknown, source: string): NodeBank {
  if (!isRecord(raw)) {
    throw bankError(source, ["objet { nodeId, questions, flashcards } attendu à la racine."]);
  }

  const errors: string[] = [];
  const nodeId = isSkillNodeId(raw.nodeId) ? raw.nodeId : undefined;
  if (nodeId === undefined) {
    errors.push(`nodeId : ${JSON.stringify(raw.nodeId)} n'est pas un identifiant de nœud connu.`);
  }

  const readQuestionId = createIdReader(nodeId, "Q", errors);
  const questions = readList(raw.questions, "questions", errors, (item, at) =>
    readQuestion(item, at, readQuestionId, errors),
  );
  if (Array.isArray(raw.questions) && raw.questions.length < MIN_QUESTIONS_PER_BANK) {
    errors.push(
      `questions : au moins ${MIN_QUESTIONS_PER_BANK} attendues, ${raw.questions.length} trouvée(s).`,
    );
  }

  const readFlashcardId = createIdReader(nodeId, "F", errors);
  const flashcards = readList(raw.flashcards, "flashcards", errors, (item, at) =>
    readFlashcard(item, at, readFlashcardId, errors),
  );

  if (errors.length > 0 || nodeId === undefined || questions === undefined || flashcards === undefined) {
    throw bankError(source, errors);
  }
  return { nodeId, questions, flashcards };
}
