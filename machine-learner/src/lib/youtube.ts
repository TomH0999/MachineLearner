// Helpers YouTube purs : importables depuis un Client Component, un Server Component et tsx (aucun alias ni dépendance).

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);
const PATH_ID_PREFIXES = ["/embed/", "/shorts/"];

/** Identifiant vidéo YouTube : 11 caractères [A-Za-z0-9_-]. */
export function getYouTubeVideoId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  let id: string | null = null;
  if (parsed.hostname === "youtu.be") {
    id = parsed.pathname.slice(1).split("/")[0];
  } else if (YOUTUBE_HOSTS.has(parsed.hostname)) {
    if (parsed.pathname === "/watch") {
      id = parsed.searchParams.get("v");
    } else {
      const prefix = PATH_ID_PREFIXES.find((candidate) => parsed.pathname.startsWith(candidate));
      if (prefix) id = parsed.pathname.slice(prefix.length).split("/")[0];
    }
  }
  return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
}

export function youTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function youTubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/** Endpoint oEmbed : 200 si la vidéo est publique et intégrable, 401/403 si privée ou intégration interdite, 404 si introuvable. */
export function youTubeOEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/oembed?url=${encodeURIComponent(youTubeWatchUrl(videoId))}&format=json`;
}
