import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Route } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Connexion" };

/** Shell statique ; un utilisateur déjà connecté est renvoyé vers le tableau de bord par RedirectIfAuthenticated. */
export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Route className="size-10 text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-semibold tracking-tight">EngiPath</h1>
          <p className="text-sm text-muted-foreground">Du BUT Informatique au cycle ingénieur IA.</p>
        </div>
        <Card>
          <CardContent>
            <AuthForm />
          </CardContent>
        </Card>
      </div>
      <Suspense fallback={null}>
        <RedirectIfAuthenticated />
      </Suspense>
    </main>
  );
}

/**
 * Vérifie une session réellement valide (et pas seulement la présence du cookie, comme le proxy) :
 * un cookie expiré ne renvoie donc pas vers /, ce qui évite une boucle / ↔ /login.
 */
async function RedirectIfAuthenticated() {
  const user = await getCurrentUser();
  if (user) redirect(ROUTES.dashboard);
  return null;
}
