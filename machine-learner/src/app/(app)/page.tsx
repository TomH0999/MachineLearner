import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Tableau de bord" };

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
          <CardTitle>État du système</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Suspense fallback={<Skeleton className="h-5 w-48" />}>
            <DatabaseStatus />
          </Suspense>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-status-locked text-white">Verrouillé</Badge>
            <Badge className="bg-status-unlocked text-white glow-unlocked">Disponible</Badge>
            <Badge className="bg-status-completed text-white">Validé</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function DatabaseStatus() {
  await connection();

  let count: number | null;
  try {
    count = await prisma.skillNode.count();
  } catch (error) {
    console.error("[DatabaseStatus] échec de la requête Prisma", error);
    count = null;
  }

  if (count === null) {
    return <p className="text-sm text-destructive">Base de données injoignable</p>;
  }

  return (
    <p className="text-sm">
      Base de données connectée · {count} module{count > 1 ? "s" : ""} en base
    </p>
  );
}
