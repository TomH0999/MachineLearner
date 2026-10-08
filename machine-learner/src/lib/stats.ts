import { topologicalOrder } from "@/lib/skill-tree/graph";
import { DOMAIN_ORDER, type CalculatedNode, type Domain, type NodeCategory } from "@/types/domain";

export interface CategoryProgress {
  completed: number;
  total: number;
  percent: number; // entier 0..100
}

export interface DomainProgress {
  domain: Domain;
  completed: number;
  total: number;
  ratio: number; // 0..1
}

export interface ProgressStats {
  but: CategoryProgress; // catégorie "BUT"
  ing: CategoryProgress; // catégorie "INGENIEUR_IA"
  overall: CategoryProgress;
  byDomain: DomainProgress[]; // les 6 domaines, dans l'ordre DOMAIN_ORDER, même si total = 0
  nextUp: CalculatedNode[]; // nœuds UNLOCKED, dans l'ordre topologique
}

const DEFAULT_NEXT_UP_LIMIT = 3;

function toCategoryProgress(nodes: readonly CalculatedNode[]): CategoryProgress {
  const total = nodes.length;
  const completed = nodes.filter((node) => node.status === "COMPLETED").length;
  return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

function inCategory(nodes: readonly CalculatedNode[], category: NodeCategory): CalculatedNode[] {
  return nodes.filter((node) => node.category === category);
}

/**
 * Statistiques du tableau de bord, dérivées de l'arbre calculé pour l'utilisateur. Pur : n'altère
 * pas `nodes`. Lève SkillGraphError si le graphe contient un cycle (via topologicalOrder).
 */
export function computeProgressStats(
  nodes: readonly CalculatedNode[],
  { nextUpLimit = DEFAULT_NEXT_UP_LIMIT }: { nextUpLimit?: number } = {},
): ProgressStats {
  if (!Number.isInteger(nextUpLimit) || nextUpLimit < 0) {
    throw new RangeError(`Statistiques : nextUpLimit invalide (${nextUpLimit}), entier ≥ 0 attendu`);
  }

  const byDomain = DOMAIN_ORDER.map((domain): DomainProgress => {
    const { completed, total } = toCategoryProgress(nodes.filter((node) => node.domain === domain));
    return { domain, completed, total, ratio: total === 0 ? 0 : completed / total };
  });

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const nextUp = topologicalOrder(nodes)
    .map((id) => nodeById.get(id))
    .filter((node): node is CalculatedNode => node?.status === "UNLOCKED")
    .slice(0, nextUpLimit);

  return {
    but: toCategoryProgress(inCategory(nodes, "BUT")),
    ing: toCategoryProgress(inCategory(nodes, "INGENIEUR_IA")),
    overall: toCategoryProgress(nodes),
    byDomain,
    nextUp,
  };
}
