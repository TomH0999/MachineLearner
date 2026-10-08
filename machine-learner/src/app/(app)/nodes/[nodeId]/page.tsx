import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardCheck, Lock } from "lucide-react";
import { CourseLayout } from "@/components/course/course-layout";
import { MarkdownRenderer } from "@/components/course/markdown-renderer";
import { VideoPlayer } from "@/components/course/video-player";
import { DOMAIN_STYLES, STATUS_BADGE_CLASSES, formatScore } from "@/components/skill-tree/styles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCourseMarkdown } from "@/lib/content/markdown";
import { getSkillNodeDetail } from "@/lib/data/content";
import { getNodeForUser, type NodeForUser } from "@/lib/data/progress";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { DOMAIN_LABELS, PASSING_SCORE, STATUS_LABELS } from "@/types/domain";

/** Contenu en cache uniquement (pas de session) : le titre ne dépend pas de l'utilisateur. */
export async function generateMetadata({ params }: PageProps<"/nodes/[nodeId]">): Promise<Metadata> {
  const { nodeId } = await params;
  const node = await getSkillNodeDetail(nodeId);
  return node ? { title: node.title, description: node.description } : { title: "Module introuvable" };
}

export default function NodePage({ params }: PageProps<"/nodes/[nodeId]">) {
  return (
    <Suspense fallback={<NodePageSkeleton />}>
      <NodeContent params={params} />
    </Suspense>
  );
}

/** Lit la session et la progression : rendu dynamique, sous Suspense. */
async function NodeContent({ params }: Pick<PageProps<"/nodes/[nodeId]">, "params">) {
  const { nodeId } = await params;
  const data = await getNodeForUser(nodeId);
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-8">
      <NodeHeader data={data} />
      {data.status === "LOCKED" ? (
        <LockedCard missingPrerequisites={data.missingPrerequisites} />
      ) : (
        <CourseSection nodeId={nodeId} data={data} />
      )}
    </div>
  );
}

function NodeHeader({ data }: { data: NodeForUser }) {
  const { node, status, bestScore } = data;
  return (
    <header className="flex max-w-3xl flex-col gap-3">
      <Link href={ROUTES.tree} className="w-fit text-sm text-muted-foreground hover:text-foreground">
        ← Arbre de compétences
      </Link>
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-muted-foreground">{node.id}</span>
        <h1 className="text-2xl font-semibold tracking-tight">{node.title}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span aria-hidden className={cn("size-2.5 rounded-full", DOMAIN_STYLES[node.domain].dot)} />
            {DOMAIN_LABELS[node.domain]}
          </span>
          <Badge className={STATUS_BADGE_CLASSES[status]}>
            {status === "LOCKED" && <Lock data-icon="inline-start" aria-hidden />}
            {STATUS_LABELS[status]}
            {status === "COMPLETED" && ` · ${formatScore(bestScore)}`}
          </Badge>
        </div>
        <p className="text-muted-foreground">{node.description}</p>
      </div>
      {status !== "LOCKED" && (
        <Button asChild className="w-fit">
          <Link href={ROUTES.quiz(node.id)}>
            <ClipboardCheck data-icon="inline-start" aria-hidden />
            {status === "COMPLETED" ? "Repasser le quiz" : "Passer le quiz"}
          </Link>
        </Button>
      )}
    </header>
  );
}

function LockedCard({ missingPrerequisites }: { missingPrerequisites: NodeForUser["missingPrerequisites"] }) {
  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock aria-hidden className="size-4" />
          Module verrouillé
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ul className="flex flex-col gap-1.5">
          {missingPrerequisites.map((prerequisite) => (
            <li key={prerequisite.id} className="flex items-baseline gap-2">
              <span className="font-mono text-xs text-muted-foreground">{prerequisite.id}</span>
              <Link href={ROUTES.node(prerequisite.id)} className="text-primary underline-offset-4 hover:underline">
                {prerequisite.title}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground">
          Valide-les (quiz ≥ {formatScore(PASSING_SCORE)}) pour accéder à ce module.
        </p>
      </CardContent>
    </Card>
  );
}

/** Vidéo (client) + fiche rendue côté serveur, passées en slots au layout client. */
async function CourseSection({ nodeId, data }: { nodeId: string; data: NodeForUser }) {
  const markdown = await getCourseMarkdown(nodeId);
  return (
    <CourseLayout
      nodeId={nodeId}
      shouldMarkViewed={data.courseViewedAt === null}
      video={<VideoPlayer lessons={data.node.lessons} />}
      sheet={
        markdown !== null ? (
          <MarkdownRenderer markdown={markdown} />
        ) : (
          <Card>
            <CardContent>
              <p className="text-muted-foreground">La fiche de cours de ce module sera bientôt disponible.</p>
            </CardContent>
          </Card>
        )
      }
    />
  );
}

function NodePageSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex max-w-3xl flex-col gap-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="aspect-video rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}
