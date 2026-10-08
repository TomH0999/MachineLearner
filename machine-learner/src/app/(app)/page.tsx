import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { DomainRadar } from "@/components/dashboard/domain-radar";
import { DOMAIN_STYLES, formatScore } from "@/components/skill-tree/styles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getDueSummary } from "@/lib/data/flashcards";
import { getUserSkillTree } from "@/lib/data/progress";
import { ROUTES } from "@/lib/routes";
import { requireUser } from "@/lib/session";
import type { DueSummary } from "@/lib/srs/queue";
import { computeProgressStats, type CategoryProgress, type ProgressStats } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/types/domain";

export const metadata: Metadata = { title: "Tableau de bord" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

/** Premier mot du nom (« Ada Lovelace » → « Ada »), chaîne vide si le nom est vide. */
function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

async function DashboardContent() {
  const [user, tree, due] = await Promise.all([requireUser(), getUserSkillTree(), getDueSummary()]);
  const stats = computeProgressStats(tree);
  const name = firstName(user.name);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Bonjour{name && `, ${name}`} 👋</h1>
        <p className="text-muted-foreground">Ta progression du BUT vers le cycle ingénieur IA.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <ProgressCard stats={stats} />
        <ReviewCard due={due} />
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Compétences par domaine</CardTitle>
            <CardDescription>Part des modules validés dans chaque domaine.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <DomainRadar data={stats.byDomain} />
          </CardContent>
        </Card>
        <NextUpCard nextUp={stats.nextUp} />
      </div>
    </div>
  );
}

function CategoryBar({ label, progress }: { label: string; progress: CategoryProgress }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          {progress.completed}/{progress.total} · {formatScore(progress.percent)}
        </span>
      </div>
      <Progress value={progress.percent} aria-label={`${label} : ${formatScore(progress.percent)} validé`} />
    </div>
  );
}

function ProgressCard({ stats }: { stats: ProgressStats }) {
  const { overall } = stats;
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Progression</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <CategoryBar label={CATEGORY_LABELS.BUT} progress={stats.but} />
        <CategoryBar label={CATEGORY_LABELS.INGENIEUR_IA} progress={stats.ing} />
        <p className="text-xs text-muted-foreground">
          {overall.completed} {overall.completed > 1 ? "modules validés" : "module validé"} sur {overall.total}
        </p>
      </CardContent>
    </Card>
  );
}

function ReviewCard({ due }: { due: DueSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Révisions du jour</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-4xl font-semibold tracking-tight tabular-nums">{due.total}</span>
          <span className="text-sm text-muted-foreground">
            {due.reviewCount} à réviser · {due.newCount} {due.newCount > 1 ? "nouvelles" : "nouvelle"}
          </span>
        </div>
        {due.total > 0 ? (
          <Button asChild className="mt-auto w-fit">
            <Link href={ROUTES.review}>Réviser maintenant</Link>
          </Button>
        ) : (
          <p className="mt-auto text-sm">Rien à réviser aujourd&apos;hui 🎉</p>
        )}
      </CardContent>
    </Card>
  );
}

function NextUpCard({ nextUp }: { nextUp: ProgressStats["nextUp"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prochaines étapes</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {nextUp.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tous les modules disponibles sont validés. Bravo !</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {nextUp.map((node) => (
              <li key={node.id} className="flex flex-col gap-1.5 rounded-lg border p-3">
                <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <span aria-hidden className={cn("size-2 rounded-full", DOMAIN_STYLES[node.domain].dot)} />
                  {node.id}
                </span>
                <span className="font-medium">{node.title}</span>
                <div className="flex flex-wrap items-center gap-4">
                  <Button asChild variant="link" size="sm" className="px-0">
                    <Link href={ROUTES.node(node.id)}>
                      Étudier <ArrowRight data-icon="inline-end" aria-hidden />
                    </Link>
                  </Button>
                  {node.category === "BUT" && (
                    <Button asChild variant="link" size="sm" className="px-0">
                      <Link href={ROUTES.quiz(node.id)}>
                        <ClipboardCheck data-icon="inline-start" aria-hidden />
                        Quiz
                      </Link>
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.tree}>Voir l&apos;arbre complet</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-52 rounded-xl lg:col-span-2" />
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}
