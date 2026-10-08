import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Lock } from "lucide-react";
import { QuizEngine } from "@/components/quiz/quiz-engine";
import { formatScore } from "@/components/skill-tree/styles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getQuestionBank, getSkillNodeDetail } from "@/lib/data/content";
import { getNodeForUser, type NodeForUser } from "@/lib/data/progress";
import { ROUTES } from "@/lib/routes";
import { PASSING_SCORE, QUIZ_QUESTION_COUNT } from "@/types/domain";
import { REQUIRE_COURSE_BEFORE_ING_QUIZ } from "@/types/quiz";

/** Contenu en cache uniquement (pas de session) : le titre ne dépend pas de l'utilisateur. */
export async function generateMetadata({ params }: PageProps<"/nodes/[nodeId]/quiz">): Promise<Metadata> {
  const { nodeId } = await params;
  const node = await getSkillNodeDetail(nodeId);
  return { title: node ? `Quiz · ${node.title}` : "Module introuvable" };
}

export default function QuizPage({ params }: PageProps<"/nodes/[nodeId]/quiz">) {
  return (
    <div className="max-w-2xl">
      <Suspense fallback={<QuizPageSkeleton />}>
        <QuizContent params={params} />
      </Suspense>
    </div>
  );
}

/** Lit la session et la progression : rendu dynamique, sous Suspense. */
async function QuizContent({ params }: Pick<PageProps<"/nodes/[nodeId]/quiz">, "params">) {
  const { nodeId } = await params;
  const data = await getNodeForUser(nodeId);
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <Link href={ROUTES.node(nodeId)} className="w-fit text-sm text-muted-foreground hover:text-foreground">
          ← {data.node.title}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Quiz : {data.node.title}</h1>
      </header>
      <QuizAccess data={data} />
    </div>
  );
}

/** Mêmes conditions d'accès que startQuizAttempt, pour afficher la bonne explication avant tout appel. */
async function QuizAccess({ data }: { data: NodeForUser }) {
  const { node, status, courseViewedAt, missingPrerequisites } = data;

  if (status === "LOCKED") {
    return <LockedCard missingPrerequisites={missingPrerequisites} />;
  }

  if (REQUIRE_COURSE_BEFORE_ING_QUIZ && node.category === "INGENIEUR_IA" && courseViewedAt === null) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4">
          <p>Ouvre d&apos;abord le cours de ce module avant de passer son quiz.</p>
          <Button asChild className="w-fit">
            <Link href={ROUTES.node(node.id)}>
              <BookOpen data-icon="inline-start" aria-hidden />
              Ouvrir le cours
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Seule la taille de la banque sort d'ici : les questions (et leurs réponses) ne quittent jamais le serveur.
  const questionCount = (await getQuestionBank(node.id)).length;
  if (questionCount < QUIZ_QUESTION_COUNT) {
    return (
      <Card>
        <CardContent>
          <p className="text-muted-foreground">
            Le quiz de ce module n&apos;est pas encore disponible : sa banque de questions est en préparation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <QuizEngine
      nodeId={node.id}
      nodeTitle={node.title}
      mode={node.category === "BUT" && courseViewedAt === null ? "bypass" : "standard"}
    />
  );
}

function LockedCard({ missingPrerequisites }: { missingPrerequisites: NodeForUser["missingPrerequisites"] }) {
  return (
    <Card>
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
          Valide-les (quiz ≥ {formatScore(PASSING_SCORE)}) pour accéder à ce quiz.
        </p>
      </CardContent>
    </Card>
  );
}

function QuizPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-72 max-w-full" />
      </div>
      <Skeleton className="h-44 w-full rounded-xl" />
    </div>
  );
}
