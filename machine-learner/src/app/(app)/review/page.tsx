import { Suspense } from "react";
import type { Metadata } from "next";
import { ReviewSession } from "@/components/flashcards/review-session";
import { Skeleton } from "@/components/ui/skeleton";
import { getReviewQueue } from "@/lib/data/flashcards";

export const metadata: Metadata = { title: "Révisions" };

export default function ReviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Révisions</h1>
        <p className="text-sm text-muted-foreground">
          Répétition espacée (SM-2) : chaque carte revient juste avant que tu l&apos;oublies.
        </p>
      </header>
      <div className="w-full max-w-xl">
        <Suspense fallback={<Skeleton className="h-80 w-full max-w-xl rounded-xl" />}>
          <ReviewSection />
        </Suspense>
      </div>
    </div>
  );
}

/** Lit la session et la file de révision : rendu dynamique, sous Suspense. */
async function ReviewSection() {
  const queue = await getReviewQueue();
  // File différente après router.refresh() → nouvelle clé → la session repart de la première carte.
  return <ReviewSession key={queue.map((card) => card.cardId).join("|")} initialQueue={queue} />;
}
