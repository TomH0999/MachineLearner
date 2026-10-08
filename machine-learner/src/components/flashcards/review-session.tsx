"use client";

import { useCallback, useRef, useState, useTransition, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, PartyPopper, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { reviewFlashcard, type ReviewErrorCode } from "@/app/(app)/review/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ReviewCard } from "@/lib/data/flashcards";
import { ROUTES } from "@/lib/routes";
import { SM2_QUALITIES, SM2_QUALITY_LABELS, type Sm2Quality } from "@/lib/srs/sm2";
import { Flashcard } from "./flashcard";

type QualityStats = Record<Sm2Quality, number>;

const EMPTY_STATS: QualityStats = { 0: 0, 3: 0, 4: 0, 5: 0 };

const QUALITY_VARIANTS: Record<Sm2Quality, "destructive" | "outline" | "default" | "secondary"> = {
  0: "destructive",
  3: "outline",
  4: "default",
  5: "secondary",
};

/** Carte disparue ou plus accessible : la renoter ne servirait à rien, on passe à la suivante. */
const SKIPPED_CARD_ERRORS: readonly ReviewErrorCode[] = ["CARD_NOT_FOUND", "CARD_NOT_AVAILABLE"];

const NETWORK_ERROR_MESSAGE = "Connexion perdue, réessaie.";

const KBD_CLASS = "rounded border bg-muted px-1 font-mono text-[0.7rem]";

/** Touche 1..n → n-ième note de SM2_QUALITIES, sinon null. */
function shortcutToQuality(key: string): Sm2Quality | null {
  if (!/^[1-9]$/.test(key)) return null;
  const index = Number(key) - 1;
  return index < SM2_QUALITIES.length ? SM2_QUALITIES[index] : null;
}

/** Ref callback stable (niveau module) : focalise l'élément à son montage. */
function focusOnMount(element: HTMLElement | null) {
  element?.focus({ preventScroll: true });
}

/**
 * Session de révision côté client : chaque note part au serveur (SM-2) avant de passer à la carte suivante.
 * La file est figée au montage ; la page change la `key` pour repartir d'une file à jour.
 */
export function ReviewSession({ initialQueue }: { initialQueue: ReviewCard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [pending, setPending] = useState(false);
  const [stats, setStats] = useState<QualityStats>(EMPTY_STATS);
  const sessionRef = useRef<HTMLDivElement | null>(null);
  const attachSession = useCallback((element: HTMLDivElement | null) => {
    sessionRef.current = element;
    focusOnMount(element);
  }, []);

  const total = initialQueue.length;
  if (total === 0) return <EmptyQueue />;
  if (index >= total) return <SessionSummary stats={stats} />;

  const card = initialQueue[index];
  const newCount = initialQueue.slice(index).filter((queued) => queued.isNew).length;
  const dueCount = total - index - newCount;

  /** Le bouton cliqué peut disparaître ou être désactivé : le focus revient à la session pour garder les raccourcis. */
  function keepKeyboardFocus() {
    sessionRef.current?.focus({ preventScroll: true });
  }

  function flip() {
    if (pending) return;
    keepKeyboardFocus();
    setFlipped((current) => !current);
  }

  function goToNextCard() {
    setIndex((current) => current + 1);
    setFlipped(false);
  }

  async function rate(quality: Sm2Quality) {
    if (pending || !flipped) return;
    keepKeyboardFocus();
    setPending(true);
    try {
      const res = await reviewFlashcard(card.cardId, quality);
      if (res.ok) {
        setStats((current) => ({ ...current, [quality]: current[quality] + 1 }));
        goToNextCard();
      } else {
        toast.error(res.message);
        if (SKIPPED_CARD_ERRORS.includes(res.error)) goToNextCard();
      }
    } catch {
      toast.error(NETWORK_ERROR_MESSAGE);
    } finally {
      setPending(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    if (event.key === " " || event.key === "Enter") {
      // Un bouton ou un lien focalisé traite Espace/Entrée lui-même : éviter un double déclenchement.
      if (event.target instanceof HTMLElement && event.target.closest("button, a")) return;
      event.preventDefault();
      flip();
      return;
    }
    const quality = shortcutToQuality(event.key);
    if (quality !== null && flipped && !pending) {
      event.preventDefault();
      void rate(quality);
    }
  }

  return (
    <div
      ref={attachSession}
      tabIndex={-1}
      role="group"
      aria-label="Session de révision"
      aria-busy={pending}
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-4 rounded-xl outline-none"
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
          <p className="font-medium tabular-nums">
            Carte {index + 1}/{total}
          </p>
          <p className="text-muted-foreground tabular-nums">
            {newCount} {newCount > 1 ? "nouvelles" : "nouvelle"} · {dueCount} à réviser
          </p>
        </div>
        <Progress value={(index / total) * 100} aria-label="Progression de la session de révision" />
      </div>

      <Flashcard
        front={card.front}
        back={card.back}
        nodeTitle={card.nodeTitle}
        isNew={card.isNew}
        flipped={flipped}
        onFlip={flip}
      />

      {flipped ? (
        <div role="group" aria-label="Noter ma réponse" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SM2_QUALITIES.map((quality, i) => (
            <Button
              key={quality}
              variant={QUALITY_VARIANTS[quality]}
              size="lg"
              disabled={pending}
              aria-keyshortcuts={String(i + 1)}
              onClick={() => void rate(quality)}
              className="h-auto flex-col gap-0.5 py-2"
            >
              {SM2_QUALITY_LABELS[quality]}
              <kbd aria-hidden className="font-mono text-[0.7rem] opacity-70">
                {i + 1}
              </kbd>
            </Button>
          ))}
        </div>
      ) : (
        <Button size="lg" className="w-full" aria-keyshortcuts="Space" onClick={flip}>
          Afficher la réponse
          <kbd aria-hidden className="font-mono text-[0.7rem] opacity-70">
            Espace
          </kbd>
        </Button>
      )}

      <p className="hidden text-center text-xs text-muted-foreground md:block">
        Raccourcis : <kbd className={KBD_CLASS}>Espace</kbd> ou <kbd className={KBD_CLASS}>Entrée</kbd> pour
        retourner la carte, <kbd className={KBD_CLASS}>1</kbd> à <kbd className={KBD_CLASS}>4</kbd> pour noter.
      </p>
    </div>
  );
}

function EmptyQueue() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aucune carte à réviser pour l&apos;instant.</CardTitle>
        <CardDescription>Ouvre un cours ou valide un quiz pour débloquer ses flashcards.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link href={ROUTES.tree}>Voir l&apos;arbre</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/** Bilan de fin de session ; « Vérifier » relit la file côté serveur (nouvelle `key` si elle a changé). */
function SessionSummary({ stats }: { stats: QualityStats }) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const reviewed = SM2_QUALITIES.reduce<number>((sum, quality) => sum + stats[quality], 0);

  return (
    <Card ref={focusOnMount} tabIndex={-1} className="animate-in outline-none fade-in zoom-in-95">
      <CardHeader className="justify-items-center text-center">
        <PartyPopper aria-hidden className="size-8 text-primary" />
        <CardTitle className="text-lg">Session terminée</CardTitle>
        <CardDescription>
          {reviewed} {reviewed > 1 ? "cartes révisées" : "carte révisée"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="flex flex-col gap-1.5 text-sm">
          {SM2_QUALITIES.map((quality) => (
            <div key={quality} className="flex items-center justify-between gap-4 rounded-lg border px-3 py-1.5">
              <dt>{SM2_QUALITY_LABELS[quality]}</dt>
              <dd className="font-semibold tabular-nums">{stats[quality]}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-muted-foreground">
          Les cartes reviendront au bon moment selon l&apos;algorithme SM-2.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={ROUTES.dashboard}>Retour au tableau de bord</Link>
          </Button>
          <Button variant="outline" disabled={refreshing} onClick={() => startRefresh(() => router.refresh())}>
            {refreshing ? (
              <Loader2 data-icon="inline-start" aria-hidden className="animate-spin" />
            ) : (
              <RefreshCw data-icon="inline-start" aria-hidden />
            )}
            Vérifier s&apos;il reste des cartes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
