"use client";

import { useState } from "react";
import ReactPlayer from "react-player";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface VideoLesson {
  id: string;
  order: number;
  title: string;
  youtubeUrl: string;
}

const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/;

/** Id YouTube d'une URL `youtube.com/watch?v=…` ou `youtu.be/…`, sinon null. */
function getYouTubeVideoId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^(www|m)\./, "");
  const id =
    host === "youtu.be"
      ? parsed.pathname.slice(1).split("/")[0]
      : host === "youtube.com" && parsed.pathname === "/watch"
        ? parsed.searchParams.get("v")
        : null;
  return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
}

function thumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function YouTubeLink({ href, className }: { href: string; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline", className)}
    >
      Ouvrir sur YouTube ↗
    </a>
  );
}

/** Lecteur YouTube (miniature d'abord : l'iframe ne se charge qu'au clic) + choix de la leçon. */
export function VideoPlayer({ lessons }: { lessons: VideoLesson[] }) {
  const [selectedId, setSelectedId] = useState(lessons[0]?.id);
  const [playing, setPlaying] = useState(false);
  const [failedIds, setFailedIds] = useState<ReadonlySet<string>>(() => new Set());

  // Repli sur la première leçon si l'id sélectionné n'existe plus (changement de nœud).
  const lesson = lessons.find((item) => item.id === selectedId) ?? lessons[0];

  if (!lesson) {
    return (
      <Card>
        <CardContent>
          <p className="text-muted-foreground">Aucune vidéo pour ce module pour l&apos;instant.</p>
        </CardContent>
      </Card>
    );
  }

  const videoId = getYouTubeVideoId(lesson.youtubeUrl);
  const thumbnail = videoId ? thumbnailUrl(videoId) : undefined;
  const failed = failedIds.has(lesson.id);

  function selectLesson(id: string) {
    setSelectedId(id);
    setPlaying(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Ratio porté par le conteneur : sans `wrapper`, react-player n'applique pas `style` à la miniature (height: 100%). */}
      <div className="aspect-video overflow-hidden rounded-xl border bg-black">
        {failed ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-white">
            <p>Cette vidéo est indisponible.</p>
            <YouTubeLink href={lesson.youtubeUrl} className="text-white/80 hover:text-white" />
          </div>
        ) : (
          <ReactPlayer
            key={lesson.id}
            src={lesson.youtubeUrl}
            controls
            light={thumbnail}
            playing={playing}
            previewAriaLabel={`Lire la vidéo : ${lesson.title}`}
            onClickPreview={() => setPlaying(true)}
            onError={() => setFailedIds((previous) => new Set(previous).add(lesson.id))}
            style={{ width: "100%", height: "auto", aspectRatio: "16/9" }}
          />
        )}
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-medium">{lesson.title}</h2>
        {!failed && <YouTubeLink href={lesson.youtubeUrl} />}
      </div>

      {lessons.length > 1 && (
        <nav aria-label="Choix de la leçon">
          <ol className="flex flex-col gap-1">
            {lessons.map((item) => {
              const active = item.id === lesson.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={active ? "true" : undefined}
                    onClick={() => selectLesson(item.id)}
                    className={cn(
                      "w-full rounded-md px-3 py-2 text-left text-sm transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      active ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    {item.order}. {item.title}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      )}
    </div>
  );
}
