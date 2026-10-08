"use server";

import { prisma } from "@/lib/db";
import { isValidNodeId } from "@/lib/data/content";
import { getNodeForUser } from "@/lib/data/progress";
import { requireUser } from "@/lib/session";

/**
 * Enregistre la première ouverture du cours d'un nœud par l'utilisateur connecté.
 * Entrée non fiable : id validé, nœud verrouillé ignoré, idempotent (seule la première ouverture compte).
 */
export async function markCourseViewed(nodeId: string): Promise<void> {
  if (typeof nodeId !== "string" || !isValidNodeId(nodeId)) return;

  const user = await requireUser();
  const data = await getNodeForUser(nodeId);
  if (!data || data.status === "LOCKED" || data.courseViewedAt !== null) return;

  const now = new Date();
  await prisma.nodeProgress.upsert({
    where: { userId_nodeId: { userId: user.id, nodeId } },
    create: { userId: user.id, nodeId, courseViewedAt: now },
    update: { courseViewedAt: now },
  });

  // Étape 18 : inscription des flashcards du nœud ici.
  // Pas de revalidation : rien de visible ne dépend encore de courseViewedAt.
}
