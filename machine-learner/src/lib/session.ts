import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";
import { io } from "next/cache";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

/**
 * Lecture de session dans une portée "use cache: private" (guide Next 16 « authentication-with-cache-components ») :
 * avec partialPrefetching, la session est résolue pendant le pré-rendu de l'App Shell, et Better Auth compare
 * l'expiration à l'heure courante (new Date()), ce qui est interdit hors d'une portée en cache.
 * Le résultat reste côté navigateur, jamais en cache serveur : les Server Actions revérifient toujours la session.
 */
async function readCurrentUser(): Promise<CurrentUser | null> {
  "use cache: private";
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const { id, name, email, image } = session.user;
  return { id, name, email, image: image ?? null };
}

/**
 * Utilisateur connecté, ou null (dédupliqué par requête).
 * Lit la requête : à appeler uniquement sous <Suspense>, dans un Route Handler ou dans une Server Action.
 */
export const getCurrentUser = cache(readCurrentUser);

/**
 * Utilisateur connecté, sinon redirection vers la page de connexion.
 * Point d'entrée de tout travail propre à l'utilisateur : `io()` exclut la suite (requêtes Prisma, dates,
 * aléatoire) de tout pré-rendu, shell statique comme App Shell de session (partialPrefetching).
 * Sans effet pendant une vraie requête et dans les Server Actions.
 * À appeler dans chaque page protégée et dans CHAQUE Server Action (vérification au plus près des données).
 */
export async function requireUser(): Promise<CurrentUser> {
  await io();
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);
  return user;
}