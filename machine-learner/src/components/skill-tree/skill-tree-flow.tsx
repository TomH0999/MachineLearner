"use client";

import "@xyflow/react/dist/style.css";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type Edge,
  type NodeMouseHandler,
} from "@xyflow/react";
import { ROUTES } from "@/lib/routes";
import { computeLayeredLayout, computeNodeDepths } from "@/lib/skill-tree/graph";
import { useIsDarkMode } from "@/lib/use-is-dark-mode";
import type { CalculatedNode, Domain } from "@/types/domain";
import { SkillNodeCard, type SkillFlowNode } from "./skill-node";
import { STATUS_COLOR_VARS } from "./styles";

// Hors du composant : un objet recréé à chaque rendu ferait remonter tous les nœuds.
const nodeTypes = { skill: SkillNodeCard };

/**
 * Clé de remontage : change dès qu'un statut ou un score change. Le graphe est non contrôlé
 * (defaultNodes/defaultEdges), donc le remonter est la seule façon de prendre en compte la nouvelle progression.
 */
export function getFlowKey(nodes: CalculatedNode[]): string {
  return nodes.map((node) => `${node.id}:${node.status}:${node.bestScore}`).join("|");
}

function buildFlowElements(
  nodes: CalculatedNode[],
  highlightDomains: readonly Domain[],
): { flowNodes: SkillFlowNode[]; flowEdges: Edge[] } {
  const positions = computeLayeredLayout(nodes);
  const depths = computeNodeDepths(nodes);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  // Sélection vide : rien n'est estompé et le rendu reste identique.
  const highlighted = new Set(highlightDomains);
  const isDimmed = (node: CalculatedNode | undefined): boolean =>
    highlighted.size > 0 && node !== undefined && !highlighted.has(node.domain);

  const flowNodes = nodes.map(
    (node): SkillFlowNode => ({
      id: node.id,
      type: "skill",
      position: positions.get(node.id) ?? { x: 0, y: 0 },
      draggable: node.status !== "LOCKED",
      ...(isDimmed(node) ? { style: { opacity: 0.2 } } : {}),
      data: {
        node,
        missingPrerequisites: node.missingPrerequisites.map((id) => ({ id, title: byId.get(id)?.title ?? id })),
      },
    }),
  );

  const flowEdges = nodes.flatMap((target) =>
    target.prerequisites.map((sourceId): Edge => {
      const source = byId.get(sourceId);
      const sourceCompleted = source?.status === "COMPLETED";
      const stroke = sourceCompleted ? STATUS_COLOR_VARS.COMPLETED : STATUS_COLOR_VARS.LOCKED;
      const dimmed = isDimmed(source) || isDimmed(target);
      // Prérequis transversal (saute au moins une colonne) : Bézier en pointillés, qui contourne
      // mieux les colonnes intermédiaires qu'un tracé en équerre.
      const isLongEdge = (depths.get(target.id) ?? 0) - (depths.get(sourceId) ?? 0) >= 2;
      return {
        id: `${sourceId}->${target.id}`,
        source: sourceId,
        target: target.id,
        type: isLongEdge ? "default" : "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: stroke },
        style: {
          stroke,
          strokeWidth: 1.5,
          ...(isLongEdge ? { strokeDasharray: "6 4" } : {}),
          ...(dimmed ? { opacity: 0.15 } : {}),
        },
        animated: sourceCompleted && target.status === "UNLOCKED",
      };
    }),
  );

  return { flowNodes, flowEdges };
}

const NO_HIGHLIGHT: readonly Domain[] = [];

export function SkillTreeFlow({
  nodes,
  highlightDomains = NO_HIGHLIGHT,
}: {
  nodes: CalculatedNode[];
  highlightDomains?: readonly Domain[]; // vide ou absent : aucun nœud estompé
}) {
  const router = useRouter();
  const isDark = useIsDarkMode();
  const { flowNodes, flowEdges } = useMemo(
    () => buildFlowElements(nodes, highlightDomains),
    [nodes, highlightDomains],
  );

  const handleNodeClick = useCallback<NodeMouseHandler<SkillFlowNode>>(
    (event, node) => {
      // Le lien « Étudier → » / « Revoir → » navigue déjà : pas de double navigation.
      if (event.target instanceof Element && event.target.closest("a")) return;
      if (node.data.node.status !== "LOCKED") router.push(ROUTES.node(node.id));
    },
    [router],
  );

  return (
    <div className="h-[calc(100dvh-12rem)] min-h-[520px] w-full overflow-hidden rounded-xl border bg-card">
      <ReactFlow<SkillFlowNode>
        defaultNodes={flowNodes}
        defaultEdges={flowEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={1.5}
        nodesConnectable={false}
        colorMode={isDark ? "dark" : "light"}
        onNodeClick={handleNodeClick}
      >
        <Background />
        <Controls showInteractive={false} />
        <MiniMap<SkillFlowNode>
          pannable
          zoomable
          style={{ width: 168, height: 112 }}
          className="hidden xl:block"
          nodeColor={(node) => STATUS_COLOR_VARS[node.data.node.status]}
        />
      </ReactFlow>
    </div>
  );
}
