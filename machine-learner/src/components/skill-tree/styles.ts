import type { Domain, NodeStatus } from "@/types/domain";

// Classes Tailwind écrites en littéraux complets : Tailwind ne détecte pas les noms construits dynamiquement.

export const DOMAIN_STYLES: Record<Domain, { accentBorder: string; dot: string; text: string }> = {
  MATHS: { accentBorder: "border-l-domain-maths", dot: "bg-domain-maths", text: "text-domain-maths" },
  DEV: { accentBorder: "border-l-domain-dev", dot: "bg-domain-dev", text: "text-domain-dev" },
  RESEAUX: { accentBorder: "border-l-domain-reseaux", dot: "bg-domain-reseaux", text: "text-domain-reseaux" },
  IA: { accentBorder: "border-l-domain-ia", dot: "bg-domain-ia", text: "text-domain-ia" },
  ARCHI: { accentBorder: "border-l-domain-archi", dot: "bg-domain-archi", text: "text-domain-archi" },
  ANGLAIS: { accentBorder: "border-l-domain-anglais", dot: "bg-domain-anglais", text: "text-domain-anglais" },
};

export const STATUS_BADGE_CLASSES: Record<NodeStatus, string> = {
  LOCKED: "bg-status-locked text-white",
  UNLOCKED: "bg-status-unlocked text-white",
  COMPLETED: "bg-status-completed text-white",
};

/** Couleurs brutes pour les props SVG/inline (MiniMap, tracé des arêtes), qui n'acceptent pas de classes. */
export const STATUS_COLOR_VARS: Record<NodeStatus, string> = {
  LOCKED: "var(--status-locked)",
  UNLOCKED: "var(--status-unlocked)",
  COMPLETED: "var(--status-completed)",
};

/** "90 %" : espace fine insécable avant le signe %, selon la typographie française. */
export function formatScore(score: number): string {
  return `${Math.round(score)} %`;
}
