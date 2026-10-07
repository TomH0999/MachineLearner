import type { Domain, NodeCategory } from "@/generated/prisma/enums";
export type { Domain, NodeCategory };

export type NodeStatus = "LOCKED" | "UNLOCKED" | "COMPLETED";

/** Données statiques d'un nœud utiles à la logique (sous-ensemble du modèle SkillNode). */
export interface SkillNodeData {
  id: string;
  title: string;
  category: NodeCategory;
  domain: Domain;
  description: string;
  prerequisites: readonly string[]; // IDs, condition ET
}

/** Progression d'un utilisateur sur un nœud (sous-ensemble de NodeProgress). */
export interface UserNodeProgress {
  nodeId: string;
  isCompleted: boolean;
  bestScore: number; // 0..100
}

export interface CalculatedNode extends SkillNodeData {
  status: NodeStatus;
  bestScore: number;
  missingPrerequisites: string[]; // vide si UNLOCKED ou COMPLETED
}

export const PASSING_SCORE = 80;
export const QUIZ_QUESTION_COUNT = 5;

export const DOMAIN_ORDER: readonly Domain[] = ["MATHS", "DEV", "RESEAUX", "IA", "ARCHI", "ANGLAIS"];

export const DOMAIN_LABELS: Record<Domain, string> = {
  MATHS: "Mathématiques",
  DEV: "Développement",
  RESEAUX: "Systèmes & Réseaux",
  IA: "Intelligence artificielle",
  ARCHI: "Architecture",
  ANGLAIS: "Anglais",
};

export const CATEGORY_LABELS: Record<NodeCategory, string> = {
  BUT: "Socle BUT",
  INGENIEUR_IA: "Passerelle Ingénieur & IA",
};

export const STATUS_LABELS: Record<NodeStatus, string> = {
  LOCKED: "Verrouillé",
  UNLOCKED: "Disponible",
  COMPLETED: "Validé",
};
