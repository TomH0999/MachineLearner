import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import { CONTENT_CACHE_TAG, isValidNodeId } from "@/lib/data/content";

/**
 * Fiche de cours Markdown d'un nœud (`content/courses/{nodeId}.md`), ou null si l'id est mal formé ou la fiche absente.
 * Le chemin est construit à partir de l'id validé uniquement (jamais de `markdownPath`) : pas de traversée de répertoire.
 */
export async function getCourseMarkdown(nodeId: string): Promise<string | null> {
  if (!isValidNodeId(nodeId)) return null;
  return getCachedCourseMarkdown(nodeId);
}

async function getCachedCourseMarkdown(nodeId: string): Promise<string | null> {
  "use cache";
  cacheTag(CONTENT_CACHE_TAG);
  cacheLife("max");

  const filePath = path.join(process.cwd(), "content", "courses", `${nodeId}.md`);
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return null;
    throw error;
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
