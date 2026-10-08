import Link from "next/link";
import { CheckCircle2, LockOpen, RotateCcw, XCircle } from "lucide-react";
import { formatScore } from "@/components/skill-tree/styles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { PASSING_SCORE } from "@/types/domain";
import type { QuizQuestionResult, QuizResult as QuizResultData } from "@/types/quiz";

/** Lettre affichée devant une option (A, B, C, D…) : identique à celle du parcours de quiz. */
function optionLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

/**
 * Résultat corrigé par le serveur : score, modules débloqués, correction détaillée et relances.
 * Sans hook ni directive : rendu uniquement depuis QuizEngine (client), qui fournit `onRetry`.
 */
export function QuizResult({
  result,
  nodeId,
  onRetry,
}: {
  result: QuizResultData;
  nodeId: string;
  onRetry: () => void;
}) {
  const { score, passed, correctCount, total, bestScore, results, newlyUnlocked } = result;

  return (
    <div className="flex flex-col gap-6">
      <Card className="animate-in fade-in zoom-in-95">
        <CardContent className="flex flex-col items-center gap-2 text-center">
          <p
            className={cn(
              "text-5xl font-bold tracking-tight tabular-nums",
              passed ? "text-status-completed" : "text-destructive",
            )}
          >
            {formatScore(score)}
          </p>
          <h2 className="text-lg font-semibold">
            {passed ? "Bravo, module validé !" : `Pas tout à fait : il faut au moins ${formatScore(PASSING_SCORE)}.`}
          </h2>
          <p className="text-sm text-muted-foreground">
            {correctCount}/{total} bonnes réponses · Meilleur score : {formatScore(bestScore)}
          </p>
        </CardContent>
      </Card>

      {newlyUnlocked.length > 0 && (
        <Card className="animate-in border border-status-unlocked glow-unlocked fade-in slide-in-from-bottom-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockOpen aria-hidden className="size-4 text-status-unlocked" />
              Nouveaux modules débloqués
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-1.5">
              {newlyUnlocked.map((unlocked) => (
                <li key={unlocked.id} className="flex items-baseline gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{unlocked.id}</span>
                  <Link href={ROUTES.node(unlocked.id)} className="text-primary underline-offset-4 hover:underline">
                    {unlocked.title}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <section aria-labelledby="quiz-corrections" className="flex flex-col gap-3">
        <h2 id="quiz-corrections" className="text-lg font-semibold">
          Corrections
        </h2>
        <ol className="flex flex-col gap-3">
          {results.map((item, index) => (
            <CorrectionItem key={item.questionId} item={item} index={index} />
          ))}
        </ol>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button onClick={onRetry}>
          <RotateCcw data-icon="inline-start" aria-hidden />
          {passed ? "Repasser pour améliorer mon score" : "Réessayer avec une nouvelle série"}
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.node(nodeId)}>Retour au module</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.tree}>Voir l&apos;arbre</Link>
        </Button>
      </div>
    </div>
  );
}

function CorrectionItem({ item, index }: { item: QuizQuestionResult; index: number }) {
  const { question, options, selectedIndex, correctIndex, isCorrect, explanation } = item;
  const StatusIcon = isCorrect ? CheckCircle2 : XCircle;

  return (
    <li className="flex flex-col gap-2 rounded-xl p-4 ring-1 ring-foreground/10">
      <span className="text-xs text-muted-foreground">Question {index + 1}</span>
      <p className="font-medium whitespace-pre-line">{question}</p>
      <p className="flex items-start gap-2 text-sm">
        <StatusIcon
          role="img"
          aria-label={isCorrect ? "Réponse correcte" : "Réponse incorrecte"}
          className={cn("mt-0.5 size-4 shrink-0", isCorrect ? "text-status-completed" : "text-destructive")}
        />
        <span>
          {selectedIndex === null ? (
            "Pas de réponse"
          ) : (
            <>
              Ta réponse : {optionLetter(selectedIndex)}. {options[selectedIndex]}
            </>
          )}
        </span>
      </p>
      {!isCorrect && (
        <p className="pl-6 text-sm">
          Bonne réponse : {optionLetter(correctIndex)}. {options[correctIndex]}
        </p>
      )}
      <p className="text-sm text-muted-foreground">{explanation}</p>
    </li>
  );
}
