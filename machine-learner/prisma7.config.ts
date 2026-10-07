import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Configuration de la CLI Prisma 7 (migrate, studio, seed) — fichier chargé en priorité par Prisma 7.10.
 * - DIRECT_URL : connexion Neon directe (hôte sans "-pooler"), si définie ; sinon DATABASE_URL.
 * - SHADOW_DATABASE_URL : optionnelle, uniquement si Neon refuse de créer la shadow database.
 * Le runtime applicatif n'utilise pas ce fichier : voir src/lib/db.ts.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts", // seed.ts et tsx arrivent à l'étape 7
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
