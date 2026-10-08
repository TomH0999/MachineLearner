"use client";

import { useEffect } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import "./globals.css";

/**
 * Remplace le layout racine quand celui-ci plante : rend ses propres <html>/<body>
 * et n'hérite ni du thème ni des polices. Lien natif : le router peut être indisponible.
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="flex min-h-dvh items-center justify-center bg-background p-4 text-foreground antialiased">
        <title>Erreur · EngiPath</title>
        <Card className="w-full max-w-md">
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
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- rechargement complet voulu : le router peut être indisponible */}
              <a href="/">Tableau de bord</a>
            </Button>
          </CardFooter>
        </Card>
      </body>
    </html>
  );
}
