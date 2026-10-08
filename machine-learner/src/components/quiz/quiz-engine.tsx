"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { startQuizAttempt, submitQuizAttempt } from "@/app/(app)/nodes/[nodeId]/quiz/actions";
import { formatScore } from "@/components/skill-tree/styles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PASSING_SCORE, QUIZ_QUESTION_COUNT } from "@/types/domain";
import {
  QUIZ_ATTEMPT_TTL_MS,
  type QuizErrorCode,
  type QuizResult as QuizResultData,
  type QuizSession,
} from "@/types/quiz";
import { QuizResult } from "./quiz-result";

type Answers = (number | null)[];

type QuizPhase =
  | { kind: "intro" }
  | { kind: "loading" }
  | { kind: "answering"; session: QuizSession; index: number; answers: Answers }
  | { kind: "submitting"; session: QuizSession; answers: Answers }
  | { kind: "result"; result: QuizResultData }
  | { kind: "error"; message: string; code: QuizErrorCode | null }; // code null : action injoignable

/** Tentative inutilisable (déjà corrigée ou expirée) : seule une nouvelle série a du sens. */
const STALE_ATTEMPT_ERRORS: readonly QuizErrorCode[] = ["ATTEMPT_EXPIRED", "ATTEMPT_ALREADY_SUBMITTED"];

const NETWORK_ERROR_MESSAGE = "Impossible de joindre le serveur : vérifie ta connexion puis réessaie.";

const INTRO_TEXT: Record<"bypass" | "standard", string> = {
  bypass: "Évaluation de positionnement : valide tes acquis sans passer par le cours.",
  standard: "Teste ta compréhension du module.",
};

function optionLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

/** Touche 1..n ou A..(n-ième lettre) → index d'option, sinon null. */
function shortcutToOption(key: string, optionCount: number): number | null {
  let index: number | null = null;
  if (/^[1-9]$/.test(key)) index = Number(key) - 1;
  else if (/^[a-z]$/i.test(key)) index = key.toUpperCase().charCodeAt(0) - 65;
  return index !== null && index < optionCount ? index : null;
}

/** Ref callback stable (niveau module) : focalise le conteneur du quiz à son montage pour activer les raccourcis. */
function focusOnMount(element: HTMLDivElement | null) {
  element?.focus({ preventScroll: true });
}

/**
 * Parcours du quiz côté client : tirage et correction par Server Actions, question par question.
 * Le client ne connaît jamais les bonnes réponses avant la correction renvoyée par le serveur.
 */
export function QuizEngine({
  nodeId,
  nodeTitle,
  mode,
}: {
  nodeId: string;
  nodeTitle: string;
  mode: "bypass" | "standard";
}) {
  const [phase, setPhase] = useState<QuizPhase>({ kind: "intro" });

  async function start() {
    setPhase({ kind: "loading" });
    try {
      const res = await startQuizAttempt(nodeId);
      if (res.ok) {
        setPhase({ kind: "answering", session: res.data, index: 0, answers: res.data.questions.map(() => null) });
      } else {
        setPhase({ kind: "error", message: res.message, code: res.error });
      }
    } catch {
      setPhase({ kind: "error", message: NETWORK_ERROR_MESSAGE, code: null });
    }
  }

  async function submit(session: QuizSession, answers: Answers) {
    setPhase({ kind: "submitting", session, answers });
    try {
      const res = await submitQuizAttempt(session.attemptId, answers);
      if (!res.ok) {
        setPhase({ kind: "error", message: res.message, code: res.error });
        return;
      }
      setPhase({ kind: "result", result: res.data });
      if (res.data.passed) toast.success("Module validé !");
      const unlockedCount = res.data.newlyUnlocked.length;
      if (unlockedCount > 0) {
        toast(`🔓 ${unlockedCount} ${unlockedCount > 1 ? "modules débloqués" : "module débloqué"}`);
      }
    } catch {
      setPhase({ kind: "error", message: NETWORK_ERROR_MESSAGE, code: null });
    }
  }

  function selectOption(optionIndex: number) {
    setPhase((current) =>
      current.kind === "answering"
        ? { ...current, answers: current.answers.map((answer, i) => (i === current.index ? optionIndex : answer)) }
        : current,
    );
  }

  function goBack() {
    if (phase.kind !== "answering" || phase.index === 0) return;
    setPhase({ ...phase, index: phase.index - 1 });
  }

  function goForward() {
    if (phase.kind !== "answering") return;
    const { session, index, answers } = phase;
    if (answers[index] === null) return;
    if (index < session.questions.length - 1) {
      setPhase({ ...phase, index: index + 1 });
    } else if (answers.every((answer) => answer !== null)) {
      void submit(session, answers);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (phase.kind !== "answering" || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "Enter") {
      // Un bouton ou un lien focalisé traite Entrée lui-même : éviter un double déclenchement.
      if (event.target instanceof HTMLElement && event.target.closest("button, a")) return;
      event.preventDefault();
      goForward();
      return;
    }
    const optionIndex = shortcutToOption(event.key, phase.session.questions[phase.index].options.length);
    if (optionIndex !== null) {
      event.preventDefault();
      selectOption(optionIndex);
    }
  }

  return (
    <section aria-label={`Quiz : ${nodeTitle}`}>
      {phase.kind === "intro" && (
        <Card>
          <CardContent className="flex flex-col gap-4">
            <p className="font-medium">{INTRO_TEXT[mode]}</p>
            <p className="text-sm text-muted-foreground">
              {QUIZ_QUESTION_COUNT} questions tirées au hasard · réussite à partir de {formatScore(PASSING_SCORE)} ·{" "}
              {QUIZ_ATTEMPT_TTL_MS / 60_000} minutes maximum
            </p>
            <Button className="w-fit" onClick={() => void start()}>
              Commencer le quiz
            </Button>
          </CardContent>
        </Card>
      )}

      {phase.kind === "loading" && (
        <Card role="status" aria-busy="true">
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 aria-hidden className="size-4 animate-spin" />
            Tirage des questions…
          </CardContent>
        </Card>
      )}

      {(phase.kind === "answering" || phase.kind === "submitting") && (
        <QuestionCard
          session={phase.session}
          // La soumission part toujours de la dernière question.
          index={phase.kind === "answering" ? phase.index : phase.session.questions.length - 1}
          answers={phase.answers}
          submitting={phase.kind === "submitting"}
          nodeTitle={nodeTitle}
          onSelect={selectOption}
          onBack={goBack}
          onForward={goForward}
          onKeyDown={handleKeyDown}
        />
      )}

      {phase.kind === "result" && <QuizResult result={phase.result} nodeId={nodeId} onRetry={() => void start()} />}

      {phase.kind === "error" && (
        <Card role="alert" className="border border-destructive/50 ring-0">
          <CardContent className="flex flex-col gap-4">
            <p className="flex items-start gap-2">
              <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" />
              {phase.message}
            </p>
            <Button variant="outline" className="w-fit" onClick={() => void start()}>
              <RotateCcw data-icon="inline-start" aria-hidden />
              {phase.code !== null && STALE_ATTEMPT_ERRORS.includes(phase.code)
                ? "Recommencer avec une nouvelle série"
                : "Réessayer"}
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function QuestionCard({
  session,
  index,
  answers,
  submitting,
  nodeTitle,
  onSelect,
  onBack,
  onForward,
  onKeyDown,
}: {
  session: QuizSession;
  index: number;
  answers: Answers;
  submitting: boolean;
  nodeTitle: string;
  onSelect: (optionIndex: number) => void;
  onBack: () => void;
  onForward: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}) {
  const groupId = useId();
  const total = session.questions.length;
  const question = session.questions[index];
  const selected = answers[index];
  const isLast = index === total - 1;
  const optionCount = question.options.length;

  return (
    <div
      ref={focusOnMount}
      tabIndex={-1}
      role="group"
      aria-label={`Questions du quiz ${nodeTitle}`}
      onKeyDown={onKeyDown}
      className="rounded-xl outline-none"
    >
      <Card>
        <CardHeader className="gap-3">
          <CardTitle>
            Question {index + 1}/{total}
          </CardTitle>
          <Progress value={(index / total) * 100} aria-label={`Progression du quiz ${nodeTitle}`} />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p aria-live="polite" aria-atomic="true" className="font-medium whitespace-pre-line">
            <span className="sr-only">
              Question {index + 1} sur {total} :{" "}
            </span>
            {question.question}
          </p>

          <fieldset key={question.id} disabled={submitting} className="flex flex-col gap-2">
            <legend className="sr-only">Réponses à la question {index + 1}</legend>
            {question.options.map((option, optionIndex) => (
              <label
                key={optionIndex}
                className="group flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-70 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
              >
                <input
                  type="radio"
                  className="sr-only"
                  name={`${groupId}-${question.id}`}
                  value={optionIndex}
                  checked={selected === optionIndex}
                  onChange={() => onSelect(optionIndex)}
                />
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-semibold transition-colors group-has-[:checked]:border-primary group-has-[:checked]:bg-primary group-has-[:checked]:text-primary-foreground">
                  {optionLetter(optionIndex)}
                </span>
                <span className="pt-0.5 whitespace-pre-line">{option}</span>
              </label>
            ))}
          </fieldset>

          <p className="hidden text-xs text-muted-foreground sm:block">
            Raccourcis : touches 1–{optionCount} ou A–{optionLetter(optionCount - 1)}, Entrée pour continuer.
          </p>

          <div className="flex items-center gap-2">
            {index > 0 && (
              <Button variant="outline" onClick={onBack} disabled={submitting}>
                Précédent
              </Button>
            )}
            {isLast ? (
              <Button
                className="ml-auto"
                onClick={onForward}
                disabled={submitting || answers.some((answer) => answer === null)}
              >
                {submitting && <Loader2 aria-hidden className="animate-spin" />}
                {submitting ? "Correction…" : "Valider le quiz"}
              </Button>
            ) : (
              <Button className="ml-auto" onClick={onForward} disabled={selected === null}>
                Suivant
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
