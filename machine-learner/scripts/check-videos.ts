// Vérifie que chaque leçon de content/skill-tree.ts pointe vers une vidéo YouTube publique et intégrable (oEmbed).
// Lecture seule : aucun fichier modifié, aucun accès à la base. Usage : npm run content:check-videos [-- --verbose]

import { SKILL_TREE } from "../content/skill-tree";
import { getYouTubeVideoId, youTubeOEmbedUrl } from "../src/lib/youtube";

const CONCURRENCY = 6;
const TIMEOUT_MS = 10_000;
const verbose = process.argv.includes("--verbose");

interface LessonEntry {
  nodeId: string;
  lessonId: string;
  title: string;
  url: string;
  videoId: string | null;
}

type CheckResult =
  | { status: "ok"; videoTitle?: string; author?: string }
  | { status: "ko"; reason: string }
  | { status: "warn"; reason: string };

async function checkVideo(videoId: string): Promise<CheckResult> {
  let response: Response;
  try {
    response = await fetch(youTubeOEmbedUrl(videoId), { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    const detail = timedOut ? `timeout ${TIMEOUT_MS / 1000} s` : error instanceof Error ? error.message : String(error);
    return { status: "warn", reason: `non vérifiée (${detail})` };
  }

  if (response.status === 200 && verbose) {
    const data = (await response.json().catch(() => null)) as { title?: unknown; author_name?: unknown } | null;
    return {
      status: "ok",
      videoTitle: typeof data?.title === "string" ? data.title : undefined,
      author: typeof data?.author_name === "string" ? data.author_name : undefined,
    };
  }
  // Libère la connexion : seul le statut nous intéresse.
  await response.body?.cancel();

  switch (response.status) {
    case 200:
      return { status: "ok" };
    case 401:
    case 403:
      return { status: "ko", reason: "vidéo privée ou intégration interdite" };
    case 404:
      return { status: "ko", reason: "vidéo introuvable" };
    default:
      return { status: "warn", reason: `non vérifiée (HTTP ${response.status})` };
  }
}

/** Pool de promesses : au plus `limit` appels de `worker` en vol, résultats dans l'ordre d'entrée. */
async function mapWithConcurrency<T, R>(items: readonly T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function run(): Promise<void> {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

function describe(lesson: LessonEntry): string {
  return `${lesson.nodeId} · ${lesson.lessonId} « ${lesson.title} »`;
}

async function main(): Promise<void> {
  // Ordre de SKILL_TREE conservé : les lignes affichées restent groupées par nœud.
  const lessons: LessonEntry[] = SKILL_TREE.flatMap((node) =>
    node.lessons.map((lesson) => ({
      nodeId: node.id,
      lessonId: lesson.id,
      title: lesson.title,
      url: lesson.youtubeUrl,
      videoId: getYouTubeVideoId(lesson.youtubeUrl),
    })),
  );

  const uniqueIds = [...new Set(lessons.flatMap((lesson) => (lesson.videoId ? [lesson.videoId] : [])))];
  const checks = await mapWithConcurrency(uniqueIds, CONCURRENCY, checkVideo);
  const resultById = new Map(uniqueIds.map((id, index) => [id, checks[index]]));

  const okLines: string[] = [];
  const koLines: string[] = [];
  const warnLines: string[] = [];

  for (const lesson of lessons) {
    if (!lesson.videoId) {
      koLines.push(`${describe(lesson)} → URL non reconnue (${lesson.url})`);
      continue;
    }
    const result = resultById.get(lesson.videoId);
    if (!result) continue;
    if (result.status === "ok") {
      const source = [result.videoTitle && `« ${result.videoTitle} »`, result.author].filter(Boolean).join(" — ");
      okLines.push(`${describe(lesson)} → ${source || "OK"} (${lesson.videoId})`);
    } else {
      (result.status === "ko" ? koLines : warnLines).push(`${describe(lesson)} → ${result.reason} (${lesson.videoId})`);
    }
  }

  if (verbose && okLines.length > 0) {
    console.log("OK :");
    for (const line of okLines) console.log(`  ${line}`);
    console.log();
  }
  if (koLines.length > 0) {
    console.log("KO :");
    for (const line of koLines) console.log(`  ${line}`);
    console.log();
  }
  if (warnLines.length > 0) {
    console.log("Avertissements :");
    for (const line of warnLines) console.log(`  ${line}`);
    console.log();
  }

  console.log(
    `${lessons.length} leçons · ${uniqueIds.length} vidéos uniques · ${okLines.length} OK · ${koLines.length} KO · ${warnLines.length} non vérifiées`,
  );
  process.exitCode = koLines.length > 0 ? 1 : 0;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
