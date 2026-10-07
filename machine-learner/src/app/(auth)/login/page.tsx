import type { Metadata } from "next";
import { Route } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Connexion" };

/** Page statique : la redirection d'un utilisateur déjà connecté est faite par le proxy. */
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
    </main>
  );
}
