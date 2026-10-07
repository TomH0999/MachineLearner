import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

/**
 * Utilisateur connecté, ou null. Mémoïsé pour la durée d'une requête (React `cache`).
 * Lit la requête : à appeler uniquement sous <Suspense>, dans un Route Handler ou dans une Server Action.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const { id, name, email, image } = session.user;
  return { id, name, email, image: image ?? null };
});

/**
 * Utilisateur connecté, sinon redirection vers la page de connexion.
 * À appeler dans chaque page protégée et dans CHAQUE Server Action (vérification au plus près des données).
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);
  return user;
}
