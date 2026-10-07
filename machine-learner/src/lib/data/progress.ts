import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { getSkillNodeDetail, getSkillNodes, isValidNodeId, type SkillNodeDetail } from "@/lib/data/content";
import { requireUser } from "@/lib/session";
import { calculateNodeStatuses } from "@/lib/skill-tree/graph";
import type { CalculatedNode, NodeStatus } from "@/types/domain";

/** Progression brute d'un utilisateur : jamais en cache, lue à chaque requête. */
function getProgressRows(userId: string) {
  return prisma.nodeProgress.findMany({
    where: { userId },
    select: { nodeId: true, isCompleted: true, bestScore: true, courseViewedAt: true },
  });
}

/**
 * Skill Tree complet de l'utilisateur connecté, statuts calculés.
 * Lit la session : à appeler sous <Suspense>. Dédupliquée par requête.
 */
export const getUserSkillTree = cache(async (): Promise<CalculatedNode[]> => {
  const user = await requireUser();
  const [nodes, progressRows] = await Promise.all([getSkillNodes(), getProgressRows(user.id)]);
  return calculateNodeStatuses(nodes, progressRows);
});

export interface NodeForUser {
  node: SkillNodeDetail;
  status: NodeStatus;
  bestScore: number;
  missingPrerequisites: { id: string; title: string }[];
  courseViewedAt: Date | null;
}

/**
 * Un nœud vu par l'utilisateur connecté, ou null si l'id est mal formé ou inconnu (la page appelle notFound()).
 * Lit la session : à appeler sous <Suspense>. Dédupliquée par requête.
 */
export const getNodeForUser = cache(async (nodeId: string): Promise<NodeForUser | null> => {
  if (!isValidNodeId(nodeId)) return null;

  const user = await requireUser();
  const [nodes, node, progressRows] = await Promise.all([
    getSkillNodes(),
    getSkillNodeDetail(nodeId),
    getProgressRows(user.id),
  ]);
  if (!node) return null;

  // Statut calculé sur tout le graphe : il faut savoir quels prérequis sont validés.
  const calculated = calculateNodeStatuses(nodes, progressRows).find((item) => item.id === nodeId);
  if (!calculated) return null;

  const titleById = new Map(nodes.map((item) => [item.id, item.title]));

  return {
    node,
    status: calculated.status,
    bestScore: calculated.bestScore,
    missingPrerequisites: calculated.missingPrerequisites.map((id) => ({
      id,
      title: titleById.get(id) ?? id,
    })),
    courseViewedAt: progressRows.find((row) => row.nodeId === nodeId)?.courseViewedAt ?? null,
  };
});
