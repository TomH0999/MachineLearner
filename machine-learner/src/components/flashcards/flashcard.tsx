"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { Badge } from "@/components/ui/badge";

type Side = "front" | "back";

const SIDE_LABELS: Record<Side, string> = { front: "Question", back: "Réponse" };

const FLIP_TRANSITION: Transition = { type: "spring", duration: 0.5, bounce: 0.2 };
/** Mouvement réduit : la carte bascule d'un coup, seul le fondu des faces reste visible. */
const INSTANT_TRANSITION: Transition = { duration: 0 };
const FADE_TRANSITION: Transition = { duration: 0.2, ease: "easeOut" };

function subscribeNothing() {
  return () => {};
}

/**
 * false au rendu serveur et pendant l'hydratation, true ensuite. useReducedMotion lit matchMedia dès le premier
 * rendu client : sans ce garde, le HTML hydraté différerait du HTML serveur.
 */
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}

/**
 * Flashcard recto/verso contrôlée par le parent (`flipped`) : rotation 3D, ou simple fondu si l'utilisateur
 * préfère réduire les animations. Le texte de la face visible est annoncé aux lecteurs d'écran.
 */
export function Flashcard({
  front,
  back,
  nodeTitle,
  isNew,
  flipped,
  onFlip,
}: {
  front: string;
  back: string;
  nodeTitle: string;
  isNew: boolean;
  flipped: boolean;
  onFlip: () => void;
}) {
  const hydrated = useHydrated();
  const reduceMotion = useReducedMotion() === true && hydrated;
  const faceProps = { nodeTitle, isNew, reduceMotion };

  return (
    <div>
      <button
        type="button"
        onClick={onFlip}
        aria-label={flipped ? "Revoir la question" : "Retourner la carte"}
        className="block w-full cursor-pointer rounded-xl outline-none [perspective:1200px] focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <motion.span
          // Nouvelle carte = nouvel élément : elle apparaît côté question au lieu de pivoter en montrant sa réponse.
          key={`${front}\u0000${back}`}
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={reduceMotion ? INSTANT_TRANSITION : FLIP_TRANSITION}
          style={{ transformStyle: "preserve-3d" }}
          className="grid"
        >
          <CardFace side="front" visible={!flipped} {...faceProps}>
            {front}
          </CardFace>
          <CardFace side="back" visible={flipped} {...faceProps}>
            {back}
          </CardFace>
        </motion.span>
      </button>
      <span aria-live="polite" aria-atomic="true" className="sr-only">
        {flipped ? `${SIDE_LABELS.back} : ${back}` : `${SIDE_LABELS.front} : ${front}`}
      </span>
    </div>
  );
}

/** Face superposée à l'autre (même cellule de grille) : la carte prend la hauteur du texte le plus long. */
function CardFace({
  side,
  visible,
  nodeTitle,
  isNew,
  reduceMotion,
  children,
}: {
  side: Side;
  visible: boolean;
  nodeTitle: string;
  isNew: boolean;
  reduceMotion: boolean;
  children: ReactNode;
}) {
  return (
    <motion.span
      aria-hidden={!visible}
      initial={false}
      // Mouvement réduit : fondu entre les faces. Sinon, backface-visibility suffit à masquer la face cachée.
      animate={{ opacity: reduceMotion && !visible ? 0 : 1 }}
      transition={FADE_TRANSITION}
      style={{ backfaceVisibility: "hidden", rotateY: side === "back" ? 180 : 0 }}
      className="flex min-h-64 flex-col items-center justify-between gap-4 rounded-xl border bg-card p-6 text-center whitespace-pre-line text-card-foreground [grid-area:1/1]"
    >
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        {nodeTitle}
        {isNew && <Badge variant="secondary">Nouvelle</Badge>}
      </span>
      <span className={side === "front" ? "text-lg font-medium" : "text-base"}>{children}</span>
      <span className="text-xs text-muted-foreground/70">{SIDE_LABELS[side]}</span>
    </motion.span>
  );
}
