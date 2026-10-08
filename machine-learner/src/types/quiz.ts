/** Ordre d'affichage : optionOrder[indexAffiché] = indexOrigine. `type` (pas interface) pour être assignable à Prisma.InputJsonValue. */
export type QuizAttemptItem = { questionId: string; optionOrder: number[] };

/** Question envoyée au client : options dans l'ordre affiché, sans la bonne réponse ni l'explication. */
export interface PublicQuizQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface QuizSession {
  attemptId: string;
  nodeId: string;
  questions: PublicQuizQuestion[];
  expiresAt: string; // ISO
}

export interface QuizQuestionResult {
  questionId: string;
  question: string;
  options: string[]; // ordre affiché
  selectedIndex: number | null; // index AFFICHÉ
  correctIndex: number; // index AFFICHÉ
  isCorrect: boolean;
  explanation: string;
}

export interface QuizResult {
  attemptId: string;
  nodeId: string;
  score: number; // 0..100
  passed: boolean;
  correctCount: number;
  total: number;
  bestScore: number; // 0..100, tentative courante comprise
  results: QuizQuestionResult[];
  newlyUnlocked: { id: string; title: string }[];
}

export type QuizErrorCode =
  | "INVALID_INPUT"
  | "NODE_NOT_FOUND"
  | "NODE_LOCKED"
  | "COURSE_NOT_VIEWED"
  | "NOT_ENOUGH_QUESTIONS"
  | "ATTEMPT_NOT_FOUND"
  | "ATTEMPT_ALREADY_SUBMITTED"
  | "ATTEMPT_EXPIRED"
  | "INVALID_ANSWERS";

export type QuizActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: QuizErrorCode; message: string };

export const QUIZ_ATTEMPT_TTL_MS = 30 * 60 * 1000;

/** Le cahier réserve l'accès direct au quiz (bypass) aux nœuds BUT : un nœud ING exige l'ouverture préalable du cours. */
export const REQUIRE_COURSE_BEFORE_ING_QUIZ = true;

export const QUIZ_ERROR_MESSAGES: Record<QuizErrorCode, string> = {
  INVALID_INPUT: "Requête invalide : recharge la page et réessaie.",
  NODE_NOT_FOUND: "Ce module n'existe pas.",
  NODE_LOCKED: "Ce module est verrouillé : valide d'abord ses prérequis.",
  COURSE_NOT_VIEWED: "Ouvre d'abord le cours de ce module avant de passer son quiz.",
  NOT_ENOUGH_QUESTIONS: "Ce module n'a pas encore assez de questions pour proposer un quiz.",
  ATTEMPT_NOT_FOUND: "Cette tentative de quiz est introuvable : relance un quiz.",
  ATTEMPT_ALREADY_SUBMITTED: "Cette tentative a déjà été corrigée : relance un quiz pour réessayer.",
  ATTEMPT_EXPIRED: `Le temps imparti (${QUIZ_ATTEMPT_TTL_MS / 60_000} min) est écoulé : relance un quiz.`,
  INVALID_ANSWERS: "Réponses invalides : recharge le quiz et réessaie.",
};
