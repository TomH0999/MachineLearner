import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db";

/** Instance Better Auth (lit BETTER_AUTH_SECRET et BETTER_AUTH_URL dans l'environnement). */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, minPasswordLength: 8, autoSignIn: true },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 jours
    updateAge: 60 * 60 * 24, // prolongée au plus une fois par jour
    cookieCache: { enabled: true, maxAge: 5 * 60 }, // évite une requête en base à chaque lecture de session
  },
  advanced: {
    // Le schéma ne définit pas de valeur par défaut pour les ids : c'est Better Auth qui les génère.
    database: { generateId: () => crypto.randomUUID() },
  },
  plugins: [nextCookies()], // doit rester le dernier plugin (pose les cookies depuis les Server Actions)
});

export type AuthSession = typeof auth.$Infer.Session;
