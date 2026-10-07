import { Suspense } from "react";
import type { Metadata } from "next";
import { SkillTreeView } from "@/components/skill-tree/skill-tree-view";
import { formatScore } from "@/components/skill-tree/styles";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserSkillTree } from "@/lib/data/progress";
import { PASSING_SCORE } from "@/types/domain";

export const metadata: Metadata = { title: "Arbre de compétences" };

export default function TreePage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Arbre de compétences</h1>
        <p className="text-sm text-muted-foreground">
          Valide un module (quiz ≥ {formatScore(PASSING_SCORE)}) pour débloquer les suivants. Clique sur un module
          disponible pour l&apos;ouvrir.
        </p>
      </header>
      <Suspense fallback={<Skeleton className="h-[520px] w-full rounded-xl" />}>
        <SkillTreeSection />
      </Suspense>
    </div>
  );
}

/** Lit la session et la progression : rendu dynamique, sous Suspense. */
async function SkillTreeSection() {
  const nodes = await getUserSkillTree();
  return <SkillTreeView nodes={nodes} />;
}
