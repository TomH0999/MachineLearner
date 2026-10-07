import type { Metadata } from "next";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserSkillTree } from "@/lib/data/progress";
import { STATUS_LABELS, type NodeStatus } from "@/types/domain";

export const metadata: Metadata = { title: "Tableau de bord" };

const STATUS_BADGES: readonly { status: NodeStatus; className: string }[] = [
  { status: "LOCKED", className: "bg-status-locked text-white" },
  { status: "UNLOCKED", className: "bg-status-unlocked text-white glow-unlocked" },
  { status: "COMPLETED", className: "bg-status-completed text-white" },
];

// Tableau de bord provisoire : remplacé à l'étape 20.
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">Ta progression du BUT vers le cycle ingénieur IA.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Ta progression</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Suspense
            fallback={
              <>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-6 w-72" />
              </>
            }
          >
            <ProgressSummary />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

/** « 0 validé », « 1 validé », « 2 validés » : singulier jusqu'à 1 inclus. */
function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count > 1 ? plural : singular}`;
}

async function ProgressSummary() {
  const nodes = await getUserSkillTree();

  const counts: Record<NodeStatus, number> = { LOCKED: 0, UNLOCKED: 0, COMPLETED: 0 };
  for (const node of nodes) counts[node.status] += 1;

  const summary = [
    pluralize(nodes.length, "module", "modules"),
    pluralize(counts.UNLOCKED, "disponible", "disponibles"),
    pluralize(counts.LOCKED, "verrouillé", "verrouillés"),
    pluralize(counts.COMPLETED, "validé", "validés"),
  ].join(" · ");

  return (
    <>
      <p className="text-sm">{summary}</p>
      <div className="flex flex-wrap gap-2">
        {STATUS_BADGES.map(({ status, className }) => (
          <Badge key={status} className={className}>
            {STATUS_LABELS[status]}
            <span className="tabular-nums">{counts[status]}</span>
          </Badge>
        ))}
      </div>
    </>
  );
}
