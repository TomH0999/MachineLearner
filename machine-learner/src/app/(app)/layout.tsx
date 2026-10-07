import { Suspense } from "react";
import { AppNav, AppNavFallback } from "@/components/layout/app-nav";
import { requireUser } from "@/lib/session";

/**
 * Shell de l'application. Attention : ce layout ne protège PAS les pages enfants,
 * qui sont rendues en parallèle de lui. Chaque page et chaque Server Action qui lit
 * des données utilisateur appelle requireUser() elle-même (DAL, étape 11).
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-1">
      <Suspense fallback={<AppNavFallback />}>
        <AuthenticatedNav />
      </Suspense>
      <main className="flex-1 pb-20 md:pb-0 md:pl-60">
        <div className="mx-auto w-full max-w-6xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}

/** Lit la session (requête) : rendu sous <Suspense>. Seuls name et email partent vers le client. */
async function AuthenticatedNav() {
  const user = await requireUser();
  return <AppNav user={{ name: user.name, email: user.email }} />;
}
