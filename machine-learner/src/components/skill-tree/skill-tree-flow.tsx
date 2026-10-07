"use client";

import "@xyflow/react/dist/style.css";

import { useCallback, useMemo, useSyncExternalStore } from "react";
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
import { computeLayeredLayout } from "@/lib/skill-tree/graph";
import type { CalculatedNode } from "@/types/domain";
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

function subscribeToThemeClass(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function useIsDarkMode(): boolean {
  return useSyncExternalStore(
    subscribeToThemeClass,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}

function buildFlowElements(nodes: CalculatedNode[]): { flowNodes: SkillFlowNode[]; flowEdges: Edge[] } {
  const positions = computeLayeredLayout(nodes);
  const byId = new Map(nodes.map((node) => [node.id, node]));

  const flowNodes = nodes.map(
    (node): SkillFlowNode => ({
      id: node.id,
      type: "skill",
      position: positions.get(node.id) ?? { x: 0, y: 0 },
      draggable: node.status !== "LOCKED",
      data: {
        node,
        missingPrerequisites: node.missingPrerequisites.map((id) => ({ id, title: byId.get(id)?.title ?? id })),
      },
    }),
  );

  const flowEdges = nodes.flatMap((target) =>
    target.prerequisites.map((sourceId): Edge => {
      const sourceCompleted = byId.get(sourceId)?.status === "COMPLETED";
      const stroke = sourceCompleted ? STATUS_COLOR_VARS.COMPLETED : STATUS_COLOR_VARS.LOCKED;
      return {
        id: `${sourceId}->${target.id}`,
        source: sourceId,
        target: target.id,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: stroke },
        style: { stroke, strokeWidth: 1.5 },
        animated: sourceCompleted && target.status === "UNLOCKED",
      };
    }),
  );

  return { flowNodes, flowEdges };
}

export function SkillTreeFlow({ nodes }: { nodes: CalculatedNode[] }) {
  const router = useRouter();
  const isDark = useIsDarkMode();
  const { flowNodes, flowEdges } = useMemo(() => buildFlowElements(nodes), [nodes]);

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
          nodeColor={(node) => STATUS_COLOR_VARS[node.data.node.status]}
        />
      </ReactFlow>
    </div>
  );
}
