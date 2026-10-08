"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";

/** Error boundary du shell applicatif : message générique, seul le digest serveur est affiché. */
export default function AppError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="mx-auto mt-16 w-full max-w-md">
      <CardHeader>
        <TriangleAlert aria-hidden className="size-6 text-destructive" />
        <CardTitle className="text-lg">Une erreur est survenue</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-muted-foreground">
          Le chargement de cette page a échoué. Réessaie ; si le problème persiste, reviens un peu plus tard.
        </p>
        {error.digest && <p className="font-mono text-xs text-muted-foreground">Référence : {error.digest}</p>}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button onClick={() => retry()}>
          <RotateCw data-icon="inline-start" aria-hidden />
          Réessayer
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.dashboard}>Tableau de bord</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
