import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Page introuvable" };

/** 404 statique : aucune lecture de session ni de données. */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center p-4">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <p className="text-6xl font-bold text-primary">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">Page introuvable</h1>
        <p className="text-muted-foreground">Ce module ou cette page n&apos;existe pas (ou plus).</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href={ROUTES.dashboard}>Tableau de bord</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.tree}>Arbre de compétences</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
