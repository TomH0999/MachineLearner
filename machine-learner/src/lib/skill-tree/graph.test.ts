import { describe, expect, it } from "vitest";
import type { Domain, NodeCategory, SkillNodeData, UserNodeProgress } from "@/types/domain";
import {
  SkillGraphError,
  assertValidSkillGraph,
  calculateNodeStatuses,
  computeLayeredLayout,
  computeNodeDepths,
  getNewlyUnlockedNodeIds,
  topologicalOrder,
  validateSkillGraph,
} from "./graph";

function makeNode(
  id: string,
  category: NodeCategory,
  domain: Domain,
  prerequisites: string[] = [],
): SkillNodeData {
  return { id, title: id, category, domain, description: `Description de ${id}`, prerequisites };
}

/** Extrait du vrai graphe EngiPath (prérequis du cahier des charges). */
const NODES: SkillNodeData[] = [
  makeNode("BUT-ALG1", "BUT", "DEV"),
  makeNode("BUT-MAT1", "BUT", "MATHS"),
  makeNode("BUT-DEV1", "BUT", "DEV"),
  makeNode("ING-ALG2", "INGENIEUR_IA", "DEV", ["BUT-ALG1", "BUT-MAT1"]),
  makeNode("ING-MAT2", "INGENIEUR_IA", "MATHS", ["BUT-MAT1"]),
  makeNode("ING-MAT3", "INGENIEUR_IA", "MATHS", ["ING-MAT2"]),
  makeNode("ING-MAT4", "INGENIEUR_IA", "MATHS", ["BUT-MAT1"]),
  makeNode("ING-IA1", "INGENIEUR_IA", "IA", ["ING-MAT2", "ING-MAT3", "ING-MAT4", "BUT-DEV1"]),
  makeNode("ING-ENG1", "INGENIEUR_IA", "ANGLAIS"),
];

function completed(nodeId: string, bestScore = 100): UserNodeProgress {
  return { nodeId, isCompleted: true, bestScore };
}

function byId<T extends { id: string }>(items: readonly T[], id: string): T {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Nœud ${id} absent du résultat`);
  return item;
}

describe("calculateNodeStatuses", () => {
  it("sans progression, débloque les nœuds BUT et ING-ENG1 et verrouille ING-IA1", () => {
    const result = calculateNodeStatuses(NODES, []);

    for (const id of ["BUT-ALG1", "BUT-MAT1", "BUT-DEV1", "ING-ENG1"]) {
      expect(byId(result, id).status).toBe("UNLOCKED");
      expect(byId(result, id).missingPrerequisites).toEqual([]);
    }
    const ia1 = byId(result, "ING-IA1");
    expect(ia1.status).toBe("LOCKED");
    expect(ia1.missingPrerequisites).toEqual(["ING-MAT2", "ING-MAT3", "ING-MAT4", "BUT-DEV1"]);
  });

  it("applique une condition ET sur les prérequis", () => {
    const onlyAlg1 = byId(calculateNodeStatuses(NODES, [completed("BUT-ALG1")]), "ING-ALG2");
    expect(onlyAlg1.status).toBe("LOCKED");
    expect(onlyAlg1.missingPrerequisites).toEqual(["BUT-MAT1"]);

    const both = byId(
      calculateNodeStatuses(NODES, [completed("BUT-ALG1"), completed("BUT-MAT1")]),
      "ING-ALG2",
    );
    expect(both.status).toBe("UNLOCKED");
    expect(both.missingPrerequisites).toEqual([]);
  });

  it("marque COMPLETED avec bestScore, 0 sans progression, et conserve l'ordre d'entrée", () => {
    const result = calculateNodeStatuses(NODES, [completed("BUT-MAT1", 90)]);

    const mat1 = byId(result, "BUT-MAT1");
    expect(mat1.status).toBe("COMPLETED");
    expect(mat1.bestScore).toBe(90);
    expect(mat1.missingPrerequisites).toEqual([]);
    expect(byId(result, "BUT-ALG1").bestScore).toBe(0);
    expect(result.map((node) => node.id)).toEqual(NODES.map((node) => node.id));
  });

  it("ne recopie pas les champs hors SkillNodeData", () => {
    const withExtra = { ...makeNode("BUT-MAT1", "BUT", "MATHS"), createdAt: new Date() } as SkillNodeData;
    const [result] = calculateNodeStatuses([withExtra], []);

    expect(result).not.toHaveProperty("createdAt");
    expect(result.id).toBe("BUT-MAT1");
  });

  it("laisse LOCKED un nœud dont un prérequis est inconnu", () => {
    const nodes = [...NODES, makeNode("ING-X", "INGENIEUR_IA", "IA", ["ING-MAT9"])];
    const x = byId(calculateNodeStatuses(nodes, []), "ING-X");

    expect(x.status).toBe("LOCKED");
    expect(x.missingPrerequisites).toEqual(["ING-MAT9"]);
  });

  it("ignore une progression portant sur un nœud inconnu", () => {
    const nodes = [...NODES, makeNode("ING-X", "INGENIEUR_IA", "IA", ["ING-GHOST"])];
    const result = calculateNodeStatuses(nodes, [completed("ING-GHOST")]);

    expect(result).toHaveLength(nodes.length);
    expect(result.some((node) => node.id === "ING-GHOST")).toBe(false);
    expect(byId(result, "ING-X").status).toBe("LOCKED");
    expect(byId(result, "ING-X").missingPrerequisites).toEqual(["ING-GHOST"]);
  });
});

describe("getNewlyUnlockedNodeIds", () => {
  it("liste les nœuds débloqués par la validation de BUT-MAT1", () => {
    const before = calculateNodeStatuses(NODES, []);
    const after = calculateNodeStatuses(NODES, [completed("BUT-MAT1")]);

    expect(getNewlyUnlockedNodeIds(before, after)).toEqual(["ING-MAT2", "ING-MAT4"]);
  });
});

describe("computeNodeDepths", () => {
  it("calcule la profondeur comme le plus long chemin depuis une racine", () => {
    const depths = computeNodeDepths(NODES);

    expect(depths.get("BUT-MAT1")).toBe(0);
    expect(depths.get("ING-MAT2")).toBe(1);
    expect(depths.get("ING-MAT3")).toBe(2);
    expect(depths.get("ING-IA1")).toBe(3);
  });
});

describe("topologicalOrder", () => {
  it("place chaque nœud après tous ses prérequis, de façon déterministe", () => {
    const order = topologicalOrder(NODES);
    const position = new Map(order.map((id, index) => [id, index]));

    expect([...order].sort()).toEqual(NODES.map((node) => node.id).sort());
    for (const node of NODES) {
      for (const prerequisite of node.prerequisites) {
        expect(position.get(prerequisite)!).toBeLessThan(position.get(node.id)!);
      }
    }
    expect(topologicalOrder(NODES)).toEqual(order);
  });
});

describe("computeLayeredLayout", () => {
  function groupYByX(layout: Map<string, { x: number; y: number }>): Map<number, number[]> {
    const columns = new Map<number, number[]>();
    for (const { x, y } of layout.values()) {
      columns.set(x, [...(columns.get(x) ?? []), y]);
    }
    return columns;
  }

  it("place x = profondeur × 300 par défaut, avec des y distincts dans une colonne", () => {
    const layout = computeLayeredLayout(NODES);
    const depths = computeNodeDepths(NODES);

    expect(layout.size).toBe(NODES.length);
    for (const node of NODES) {
      expect(layout.get(node.id)?.x).toBe(depths.get(node.id)! * 300);
    }
    for (const ys of groupYByX(layout).values()) {
      expect(new Set(ys).size).toBe(ys.length);
    }
  });

  it("respecte columnGap et rowGap personnalisés", () => {
    const layout = computeLayeredLayout(NODES, { columnGap: 100, rowGap: 50 });
    const depths = computeNodeDepths(NODES);

    for (const node of NODES) {
      expect(layout.get(node.id)?.x).toBe(depths.get(node.id)! * 100);
    }
    for (const ys of groupYByX(layout).values()) {
      const sorted = [...ys].sort((a, b) => a - b);
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i] - sorted[i - 1]).toBe(50);
      }
    }
  });
});

describe("validateSkillGraph", () => {
  it("ne signale rien sur un graphe valide", () => {
    expect(validateSkillGraph(NODES)).toEqual([]);
  });

  it.each([
    {
      label: "un ID en double",
      extra: [makeNode("BUT-MAT1", "BUT", "MATHS")],
      kind: "DUPLICATE_ID",
      nodeId: "BUT-MAT1",
    },
    {
      label: "un prérequis inconnu",
      extra: [makeNode("ING-X", "INGENIEUR_IA", "IA", ["ING-MAT9"])],
      kind: "UNKNOWN_PREREQUISITE",
      nodeId: "ING-X",
    },
    {
      label: "un auto-prérequis",
      extra: [makeNode("ING-SELF", "INGENIEUR_IA", "IA", ["ING-SELF"])],
      kind: "SELF_PREREQUISITE",
      nodeId: "ING-SELF",
    },
    {
      label: "un nœud BUT avec prérequis",
      extra: [makeNode("BUT-X", "BUT", "DEV", ["BUT-MAT1"])],
      kind: "BUT_WITH_PREREQUISITES",
      nodeId: "BUT-X",
    },
  ])("détecte $label", ({ extra, kind, nodeId }) => {
    const issues = validateSkillGraph([...NODES, ...extra]);

    expect(issues).toContainEqual(expect.objectContaining({ kind, nodeId }));
  });

  it("détecte un cycle A → B → A", () => {
    const cyclic = [
      ...NODES,
      makeNode("ING-A", "INGENIEUR_IA", "IA", ["ING-B"]),
      makeNode("ING-B", "INGENIEUR_IA", "IA", ["ING-A"]),
    ];
    const cycles = validateSkillGraph(cyclic).filter((issue) => issue.kind === "CYCLE");

    expect(cycles.length).toBeGreaterThan(0);
    for (const issue of cycles) {
      expect(["ING-A", "ING-B"]).toContain(issue.nodeId);
    }
  });
});

describe("assertValidSkillGraph et erreurs de cycle", () => {
  const cyclic = [
    makeNode("ING-A", "INGENIEUR_IA", "IA", ["ING-B"]),
    makeNode("ING-B", "INGENIEUR_IA", "IA", ["ING-A"]),
  ];

  it("ne lève rien sur la fixture et lève une SkillGraphError sur un graphe invalide", () => {
    expect(() => assertValidSkillGraph(NODES)).not.toThrow();
    expect(() => assertValidSkillGraph([...NODES, makeNode("BUT-X", "BUT", "DEV", ["BUT-MAT1"])])).toThrow(
      SkillGraphError,
    );
  });

  it("topologicalOrder et computeNodeDepths lèvent une SkillGraphError sur un cycle", () => {
    expect(() => topologicalOrder(cyclic)).toThrow(SkillGraphError);
    expect(() => computeNodeDepths(cyclic)).toThrow(SkillGraphError);
  });
});
