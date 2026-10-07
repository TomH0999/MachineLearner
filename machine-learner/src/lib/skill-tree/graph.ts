import {
  DOMAIN_ORDER,
  type CalculatedNode,
  type NodeStatus,
  type SkillNodeData,
  type UserNodeProgress,
} from "@/types/domain";

/** Erreur levée quand le graphe de compétences est inexploitable (cycle, données invalides). */
export class SkillGraphError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SkillGraphError";
  }
}

// ─── Statuts ───

/** Prérequis de `node` absents de `completedIds`, dans l'ordre de `node.prerequisites`. */
export function getMissingPrerequisites(
  node: SkillNodeData,
  completedIds: ReadonlySet<string>,
): string[] {
  return node.prerequisites.filter((id) => !completedIds.has(id));
}

/**
 * Statut de chaque nœud, dans l'ordre de `nodes`.
 * COMPLETED si la progression est validée ; sinon UNLOCKED si tous les prérequis sont validés
 * (condition ET) ; sinon LOCKED. Un prérequis inconnu n'est jamais validé, et les progressions
 * de nœuds inconnus sont ignorées.
 */
export function calculateNodeStatuses(
  nodes: readonly SkillNodeData[],
  progresses: readonly UserNodeProgress[],
): CalculatedNode[] {
  const knownIds = new Set(nodes.map((node) => node.id));
  const progressById = new Map<string, UserNodeProgress>();
  for (const progress of progresses) {
    if (knownIds.has(progress.nodeId)) progressById.set(progress.nodeId, progress);
  }

  const completedIds = new Set<string>();
  for (const progress of progressById.values()) {
    if (progress.isCompleted) completedIds.add(progress.nodeId);
  }

  return nodes.map((node) => {
    const missing = getMissingPrerequisites(node, completedIds);
    let status: NodeStatus;
    if (completedIds.has(node.id)) status = "COMPLETED";
    else if (missing.length === 0) status = "UNLOCKED";
    else status = "LOCKED";

    // Champs recopiés un à un : l'appelant peut passer un objet Prisma plus large.
    return {
      id: node.id,
      title: node.title,
      category: node.category,
      domain: node.domain,
      description: node.description,
      prerequisites: [...node.prerequisites],
      status,
      bestScore: progressById.get(node.id)?.bestScore ?? 0,
      missingPrerequisites: status === "LOCKED" ? missing : [],
    };
  });
}

/** IDs passés de LOCKED à UNLOCKED ou COMPLETED, dans l'ordre de `after` (animation post-quiz). */
export function getNewlyUnlockedNodeIds(
  before: readonly CalculatedNode[],
  after: readonly CalculatedNode[],
): string[] {
  const lockedBefore = new Set(before.filter((node) => node.status === "LOCKED").map((node) => node.id));
  return after
    .filter((node) => node.status !== "LOCKED" && lockedBefore.has(node.id))
    .map((node) => node.id);
}

// ─── Structure du graphe ───

interface SkillGraph {
  /** IDs dans l'ordre d'entrée (première occurrence en cas de doublon). */
  ids: string[];
  nodeById: Map<string, SkillNodeData>;
  /** Prérequis connus et dédoublonnés de chaque nœud (auto-référence comprise). */
  prerequisitesById: Map<string, string[]>;
}

function buildGraph(nodes: readonly SkillNodeData[]): SkillGraph {
  const nodeById = new Map<string, SkillNodeData>();
  for (const node of nodes) {
    if (!nodeById.has(node.id)) nodeById.set(node.id, node);
  }
  const prerequisitesById = new Map<string, string[]>();
  for (const [id, node] of nodeById) {
    prerequisitesById.set(id, [...new Set(node.prerequisites)].filter((p) => nodeById.has(p)));
  }
  return { ids: [...nodeById.keys()], nodeById, prerequisitesById };
}

/** Insère `id` dans `queue` triée par rang croissant (recherche dichotomique). */
function insertByRank(queue: string[], id: string, rankById: ReadonlyMap<string, number>): void {
  const rank = rankById.get(id) ?? 0;
  let low = 0;
  let high = queue.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if ((rankById.get(queue[mid]) ?? 0) < rank) low = mid + 1;
    else high = mid;
  }
  queue.splice(low, 0, id);
}

/** Kahn : parmi les nœuds disponibles, le premier dans l'ordre d'entrée passe en tête. */
function orderGraph(graph: SkillGraph): string[] {
  const rankById = new Map(graph.ids.map((id, index) => [id, index]));
  const inDegree = new Map<string, number>();
  const dependentsById = new Map<string, string[]>(graph.ids.map((id) => [id, []]));
  for (const id of graph.ids) {
    const prerequisites = graph.prerequisitesById.get(id) ?? [];
    inDegree.set(id, prerequisites.length);
    for (const prerequisite of prerequisites) dependentsById.get(prerequisite)?.push(id);
  }

  const ready = graph.ids.filter((id) => inDegree.get(id) === 0);
  const order: string[] = [];
  for (let id = ready.shift(); id !== undefined; id = ready.shift()) {
    order.push(id);
    for (const dependent of dependentsById.get(id) ?? []) {
      const remaining = (inDegree.get(dependent) ?? 0) - 1;
      inDegree.set(dependent, remaining);
      if (remaining === 0) insertByRank(ready, dependent, rankById);
    }
  }

  if (order.length < graph.ids.length) {
    const blocked = graph.ids.filter((id) => (inDegree.get(id) ?? 0) > 0);
    throw new SkillGraphError(
      `Cycle détecté : impossible d'ordonner ${blocked.join(", ")} (détail via validateSkillGraph)`,
    );
  }
  return order;
}

/** Profondeur calculée une seule fois par nœud, en suivant l'ordre topologique. */
function depthsInOrder(graph: SkillGraph, order: readonly string[]): Map<string, number> {
  const depths = new Map<string, number>();
  for (const id of order) {
    let depth = 0;
    for (const prerequisite of graph.prerequisitesById.get(id) ?? []) {
      depth = Math.max(depth, (depths.get(prerequisite) ?? 0) + 1);
    }
    depths.set(id, depth);
  }
  return depths;
}

/**
 * Profondeur de chaque nœud : 0 sans prérequis, sinon 1 + la profondeur maximale de ses
 * prérequis (plus long chemin). Prérequis inconnus ignorés. O(n + e). Lève SkillGraphError si cycle.
 */
export function computeNodeDepths(nodes: readonly SkillNodeData[]): Map<string, number> {
  const graph = buildGraph(nodes);
  return depthsInOrder(graph, orderGraph(graph));
}

/**
 * Ordre topologique (Kahn) : chaque nœud apparaît après ses prérequis ; à choix égal, l'ordre
 * d'entrée départage. Prérequis inconnus ignorés. Lève SkillGraphError si cycle.
 */
export function topologicalOrder(nodes: readonly SkillNodeData[]): string[] {
  return orderGraph(buildGraph(nodes));
}

// ─── Layout React Flow ───

export interface NodePosition {
  x: number;
  y: number;
}

/**
 * Placement en couches de gauche à droite : colonne = profondeur. Dans une colonne, tri par
 * domaine (DOMAIN_ORDER) puis par ordre topologique ; chaque colonne est centrée verticalement.
 */
export function computeLayeredLayout(
  nodes: readonly SkillNodeData[],
  options: { columnGap?: number; rowGap?: number } = {},
): Map<string, NodePosition> {
  const columnGap = options.columnGap ?? 300;
  const rowGap = options.rowGap ?? 140;

  const graph = buildGraph(nodes);
  const order = orderGraph(graph);
  const depths = depthsInOrder(graph, order);
  const topoRank = new Map(order.map((id, index) => [id, index]));
  const domainRank = new Map(DOMAIN_ORDER.map((domain, index) => [domain, index]));
  const domainRankOf = (id: string): number => {
    const domain = graph.nodeById.get(id)?.domain;
    return domain === undefined ? DOMAIN_ORDER.length : (domainRank.get(domain) ?? DOMAIN_ORDER.length);
  };

  const columns = new Map<number, string[]>();
  for (const id of order) {
    const depth = depths.get(id) ?? 0;
    const column = columns.get(depth);
    if (column) column.push(id);
    else columns.set(depth, [id]);
  }

  let tallest = 0;
  for (const column of columns.values()) tallest = Math.max(tallest, column.length);

  const positions = new Map<string, NodePosition>();
  for (const [depth, column] of columns) {
    column.sort(
      (a, b) => domainRankOf(a) - domainRankOf(b) || (topoRank.get(a) ?? 0) - (topoRank.get(b) ?? 0),
    );
    const offset = ((tallest - column.length) * rowGap) / 2;
    column.forEach((id, index) => {
      positions.set(id, { x: depth * columnGap, y: offset + index * rowGap });
    });
  }
  return positions;
}

// ─── Validation (seed) ───

export type SkillGraphIssueKind =
  | "DUPLICATE_ID"
  | "UNKNOWN_PREREQUISITE"
  | "SELF_PREREQUISITE"
  | "CYCLE"
  | "BUT_WITH_PREREQUISITES";

export interface SkillGraphIssue {
  kind: SkillGraphIssueKind;
  nodeId: string;
  message: string; // en français, ex. « ING-IA1 : prérequis inconnu "ING-MAT9" »
}

/**
 * Cycles par DFS itératif à trois couleurs (ne lève jamais d'exception).
 * Dans « A → B → A », la flèche se lit « requiert ». Les auto-références sont exclues
 * (déjà signalées en SELF_PREREQUISITE).
 */
function findCycles(graph: SkillGraph): SkillGraphIssue[] {
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>(graph.ids.map((id) => [id, WHITE]));
  const edgesOf = (id: string): string[] =>
    (graph.prerequisitesById.get(id) ?? []).filter((prerequisite) => prerequisite !== id);
  const issues: SkillGraphIssue[] = [];

  for (const root of graph.ids) {
    if (color.get(root) !== WHITE) continue;
    color.set(root, GRAY);
    const stack = [{ id: root, edges: edgesOf(root), next: 0 }];

    for (let frame = stack.at(-1); frame !== undefined; frame = stack.at(-1)) {
      if (frame.next >= frame.edges.length) {
        color.set(frame.id, BLACK);
        stack.pop();
        continue;
      }
      const target = frame.edges[frame.next];
      frame.next += 1;
      const targetColor = color.get(target);
      if (targetColor === WHITE) {
        color.set(target, GRAY);
        stack.push({ id: target, edges: edgesOf(target), next: 0 });
      } else if (targetColor === GRAY) {
        const path = stack.slice(stack.findIndex((f) => f.id === target)).map((f) => f.id);
        issues.push({
          kind: "CYCLE",
          nodeId: target,
          message: `Cycle détecté : ${[...path, target].join(" → ")}`,
        });
      }
    }
  }
  return issues;
}

/** Liste tous les problèmes du graphe ; un graphe valide retourne []. */
export function validateSkillGraph(nodes: readonly SkillNodeData[]): SkillGraphIssue[] {
  const knownIds = new Set(nodes.map((node) => node.id));
  const seenIds = new Set<string>();
  const issues: SkillGraphIssue[] = [];

  for (const node of nodes) {
    if (seenIds.has(node.id)) {
      issues.push({ kind: "DUPLICATE_ID", nodeId: node.id, message: `${node.id} : identifiant en double` });
    }
    seenIds.add(node.id);

    // Le socle BUT doit être débloqué dès le départ.
    if (node.category === "BUT" && node.prerequisites.length > 0) {
      issues.push({
        kind: "BUT_WITH_PREREQUISITES",
        nodeId: node.id,
        message: `${node.id} : un nœud du socle BUT ne doit avoir aucun prérequis (${node.prerequisites.join(", ")})`,
      });
    }

    for (const prerequisite of new Set(node.prerequisites)) {
      if (prerequisite === node.id) {
        issues.push({
          kind: "SELF_PREREQUISITE",
          nodeId: node.id,
          message: `${node.id} : se cite lui-même comme prérequis`,
        });
      } else if (!knownIds.has(prerequisite)) {
        issues.push({
          kind: "UNKNOWN_PREREQUISITE",
          nodeId: node.id,
          message: `${node.id} : prérequis inconnu "${prerequisite}"`,
        });
      }
    }
  }

  issues.push(...findCycles(buildGraph(nodes)));
  return issues;
}

/** Lève une SkillGraphError listant tous les problèmes (appelé par le seed avant toute écriture). */
export function assertValidSkillGraph(nodes: readonly SkillNodeData[]): void {
  const issues = validateSkillGraph(nodes);
  if (issues.length > 0) {
    throw new SkillGraphError(
      `Graphe de compétences invalide (${issues.length} problème(s)) :\n${issues
        .map((issue) => `- ${issue.message}`)
        .join("\n")}`,
    );
  }
}
