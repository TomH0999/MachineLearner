import { describe, expect, it } from "vitest";
import { calculateNodeStatuses, topologicalOrder } from "@/lib/skill-tree/graph";
import {
  DOMAIN_ORDER,
  type CalculatedNode,
  type Domain,
  type NodeCategory,
  type NodeStatus,
  type SkillNodeData,
} from "@/types/domain";
import { computeProgressStats } from "./stats";

function makeData(
  id: string,
  category: NodeCategory,
  domain: Domain,
  prerequisites: string[] = [],
): SkillNodeData {
  return { id, title: id, category, domain, description: `Description de ${id}`, prerequisites };
}

function makeNode(
  id: string,
  category: NodeCategory,
  domain: Domain,
  status: NodeStatus,
  prerequisites: string[] = [],
): CalculatedNode {
  return {
    ...makeData(id, category, domain, prerequisites),
    status,
    bestScore: status === "COMPLETED" ? 100 : 0,
    missingPrerequisites: [],
  };
}

/** Extrait du vrai graphe EngiPath (prérequis du cahier des charges), statuts à calculer. */
const GRAPH: SkillNodeData[] = [
  makeData("BUT-ALG1", "BUT", "DEV"),
  makeData("BUT-MAT1", "BUT", "MATHS"),
  makeData("BUT-DEV1", "BUT", "DEV"),
  makeData("ING-ALG2", "INGENIEUR_IA", "DEV", ["BUT-ALG1", "BUT-MAT1"]),
  makeData("ING-MAT2", "INGENIEUR_IA", "MATHS", ["BUT-MAT1"]),
  makeData("ING-MAT3", "INGENIEUR_IA", "MATHS", ["ING-MAT2"]),
  makeData("ING-MAT4", "INGENIEUR_IA", "MATHS", ["BUT-MAT1"]),
  makeData("ING-IA1", "INGENIEUR_IA", "IA", ["ING-MAT2", "ING-MAT3", "ING-MAT4", "BUT-DEV1"]),
  makeData("ING-ENG1", "INGENIEUR_IA", "ANGLAIS"),
];

function treeWithCompleted(nodes: readonly SkillNodeData[], completedIds: readonly string[]): CalculatedNode[] {
  return calculateNodeStatuses(
    nodes,
    completedIds.map((nodeId) => ({ nodeId, isCompleted: true, bestScore: 100 })),
  );
}

/** 6 nœuds BUT (2 validés) et 9 nœuds ING (1 validé), répartis sur les 6 domaines. */
const FIFTEEN_NODES: CalculatedNode[] = [
  makeNode("BUT-MAT1", "BUT", "MATHS", "COMPLETED"),
  makeNode("BUT-ALG1", "BUT", "DEV", "COMPLETED"),
  makeNode("BUT-DEV1", "BUT", "DEV", "UNLOCKED"),
  makeNode("BUT-RES1", "BUT", "RESEAUX", "UNLOCKED"),
  makeNode("BUT-ARC1", "BUT", "ARCHI", "UNLOCKED"),
  makeNode("BUT-ANG1", "BUT", "ANGLAIS", "UNLOCKED"),
  makeNode("ING-MAT2", "INGENIEUR_IA", "MATHS", "COMPLETED", ["BUT-MAT1"]),
  makeNode("ING-MAT3", "INGENIEUR_IA", "MATHS", "UNLOCKED", ["ING-MAT2"]),
  makeNode("ING-MAT4", "INGENIEUR_IA", "MATHS", "UNLOCKED", ["BUT-MAT1"]),
  makeNode("ING-ALG2", "INGENIEUR_IA", "DEV", "UNLOCKED", ["BUT-ALG1", "BUT-MAT1"]),
  makeNode("ING-IA1", "INGENIEUR_IA", "IA", "LOCKED", ["ING-MAT3", "ING-MAT4", "BUT-DEV1"]),
  makeNode("ING-IA2", "INGENIEUR_IA", "IA", "LOCKED", ["ING-IA1"]),
  makeNode("ING-IA3", "INGENIEUR_IA", "IA", "LOCKED", ["ING-IA2"]),
  makeNode("ING-ARC2", "INGENIEUR_IA", "ARCHI", "LOCKED", ["BUT-ARC1"]),
  makeNode("ING-ENG1", "INGENIEUR_IA", "ANGLAIS", "UNLOCKED"),
];

describe("computeProgressStats", () => {
  it("renvoie des compteurs nuls pour un arbre vide", () => {
    const stats = computeProgressStats([]);

    for (const category of [stats.but, stats.ing, stats.overall]) {
      expect(category).toEqual({ completed: 0, total: 0, percent: 0 });
    }
    expect(stats.byDomain).toHaveLength(6);
    for (const domain of stats.byDomain) {
      expect(domain).toMatchObject({ completed: 0, total: 0, ratio: 0 });
    }
    expect(stats.nextUp).toEqual([]);
  });

  it("calcule les pourcentages arrondis par catégorie et au global", () => {
    const stats = computeProgressStats(FIFTEEN_NODES);

    expect(stats.but).toEqual({ completed: 2, total: 6, percent: 33 });
    expect(stats.ing).toEqual({ completed: 1, total: 9, percent: 11 });
    expect(stats.overall).toEqual({ completed: 3, total: 15, percent: 20 });
  });

  it("suit l'ordre de DOMAIN_ORDER avec des ratios exacts", () => {
    const stats = computeProgressStats(FIFTEEN_NODES);

    expect(stats.byDomain.map((entry) => entry.domain)).toEqual([...DOMAIN_ORDER]);
    const byDomain = Object.fromEntries(stats.byDomain.map((entry) => [entry.domain, entry]));
    expect(byDomain.MATHS).toEqual({ domain: "MATHS", completed: 2, total: 4, ratio: 0.5 });
    expect(byDomain.DEV).toEqual({ domain: "DEV", completed: 1, total: 3, ratio: 1 / 3 });
    expect(byDomain.RESEAUX).toEqual({ domain: "RESEAUX", completed: 0, total: 1, ratio: 0 });
    expect(byDomain.IA).toEqual({ domain: "IA", completed: 0, total: 3, ratio: 0 });
    expect(byDomain.ARCHI).toEqual({ domain: "ARCHI", completed: 0, total: 2, ratio: 0 });
    expect(byDomain.ANGLAIS).toEqual({ domain: "ANGLAIS", completed: 0, total: 2, ratio: 0 });
  });

  it("garde un domaine sans nœud avec total et ratio à 0", () => {
    const stats = computeProgressStats([makeNode("BUT-MAT1", "BUT", "MATHS", "COMPLETED")]);

    expect(stats.byDomain).toHaveLength(6);
    expect(stats.byDomain[0]).toEqual({ domain: "MATHS", completed: 1, total: 1, ratio: 1 });
    expect(stats.byDomain.slice(1).every((entry) => entry.total === 0 && entry.ratio === 0)).toBe(true);
  });

  describe("nextUp", () => {
    it("ne garde que des nœuds UNLOCKED, au plus 3, dans l'ordre topologique", () => {
      // Entrée inversée : l'ordre de sortie ne doit pas dépendre de l'ordre de la liste.
      const tree = treeWithCompleted([...GRAPH].reverse(), ["BUT-MAT1", "BUT-ALG1"]);
      const { nextUp } = computeProgressStats(tree);

      expect(nextUp).toHaveLength(3);
      expect(nextUp.every((node) => node.status === "UNLOCKED")).toBe(true);
      const rank = new Map(topologicalOrder(tree).map((id, index) => [id, index]));
      const ranks = nextUp.map((node) => rank.get(node.id) ?? -1);
      expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    });

    it("place un prérequis avant le nœud qui en dépend, même listé après lui", () => {
      const tree = [
        makeNode("ING-B", "INGENIEUR_IA", "DEV", "UNLOCKED", ["BUT-A"]),
        makeNode("BUT-A", "BUT", "DEV", "UNLOCKED"),
      ];

      expect(computeProgressStats(tree).nextUp.map((node) => node.id)).toEqual(["BUT-A", "ING-B"]);
    });

    it("respecte nextUpLimit", () => {
      const tree = treeWithCompleted(GRAPH, ["BUT-MAT1", "BUT-ALG1"]);
      const unlockedIds = tree.filter((node) => node.status === "UNLOCKED").map((node) => node.id);

      expect(computeProgressStats(tree, { nextUpLimit: 1 }).nextUp).toHaveLength(1);
      expect(computeProgressStats(tree, { nextUpLimit: 0 }).nextUp).toEqual([]);
      const all = computeProgressStats(tree, { nextUpLimit: 50 }).nextUp.map((node) => node.id);
      expect([...all].sort()).toEqual([...unlockedIds].sort());
    });

    it("rejette un nextUpLimit négatif ou non entier", () => {
      expect(() => computeProgressStats(FIFTEEN_NODES, { nextUpLimit: -1 })).toThrow(RangeError);
      expect(() => computeProgressStats(FIFTEEN_NODES, { nextUpLimit: 1.5 })).toThrow(RangeError);
    });

    it("est vide quand tous les modules sont validés", () => {
      const tree = treeWithCompleted(GRAPH, GRAPH.map((node) => node.id));

      expect(computeProgressStats(tree).nextUp).toEqual([]);
      expect(computeProgressStats(tree).overall.percent).toBe(100);
    });
  });

  it("ne mute pas les entrées", () => {
    const snapshot = structuredClone(FIFTEEN_NODES);

    computeProgressStats(FIFTEEN_NODES, { nextUpLimit: 2 });

    expect(FIFTEEN_NODES).toEqual(snapshot);
  });
});
