# EngiPath : plan de réalisation atomique pour Claude Code (terminal WebStorm)

## Contexte

Le but est de découper le cahier des charges EngiPath (Skill Tree BUT → Ingénieur/IA, quiz anti-triche, flashcards SM-2, dashboard) en étapes de 2 à 4 fichiers chacune. Chaque étape a un prompt autonome à coller dans Claude Code. Ce document contient le plan global, la préparation et le **prompt de l'Étape 1 uniquement**. Les prompts suivants seront écrits après ton retour (validation ou logs), pour s'ajuster au code réellement produit. Je ne modifie pas ton projet : c'est toi qui exécutes les prompts.

**Constats faits sur `C:\Tom\Creations\Machine_Learner\machine-learner` :**
- Les versions installées sont récentes, et les prompts doivent en tenir compte :
    - Next **16.4.0** et React 19.3.
    - Tailwind v4 branché par le loader `@tailwindcss/turbopack` (il n'y a pas de PostCSS).
    - `next.config.ts` active `cacheComponents: true` et `partialPrefetching: true`.
- Prisma est en **7.10.0**. Le generator `prisma-client` écrit dans `src/generated/prisma` (ce dossier est ignoré par git) et la datasource n'a pas d'`url`.
- Il manque encore pour Prisma :
    - le fichier **`prisma.config.ts`**, absent ;
    - le driver adapter, non installé.
- Dépendances absentes : `shadcn/ui`, `remark-math`, `rehype-katex`, `tsx`. `zustand` et `dotenv` ne sont présents qu'en dépendances transitives.
- `.env` contient `DATABASE_URL`. Je n'ai lu que le nom de la variable, jamais sa valeur.
- Le projet n'est pas un dépôt git, et il n'y a pas de `CLAUDE.md`. `AGENTS.md` (doc Next 16 dans `node_modules/next/dist/docs/`) n'est donc pas chargé par Claude Code.
- La PARTIE 8 (seed) est incomplète : 6 nœuds sur 15. Elle est aussi **destructive** : ses `deleteMany` effacent la progression des utilisateurs.
- Contenu pédagogique en cache ("use cache" + cacheTag("content") + cacheLife("max")) : après `npm run db:seed`, redémarrer `npm run dev`.
- Ne jamais appeler depuis un Server Component une fonction exportée par un fichier "use client" (seuls ses composants sont utilisables côté serveur) : placer les helpers purs dans un module sans directive.

**Décisions que tu as validées :** Better Auth (email + mot de passe). Le texte du cahier fait foi pour les prérequis : ING-ENG1 est indépendant, et IA1 = MAT2 + MAT3 + MAT4 + DEV1.

## Décisions d'architecture (Tech Lead)

1. **Prisma 7 avec `@prisma/adapter-pg`.** L'application utilise `DATABASE_URL` (connexion poolée Neon). La CLI utilise `DIRECT_URL` (connexion directe), et à défaut `DATABASE_URL`.
2. **Le contenu a des IDs stables** (`BUT-ALG1-Q01`, `-F01`, `-L01`) et le seed se contente d'upserts. On peut relancer le seed sans jamais effacer la progression.
3. **Les statuts LOCKED/UNLOCKED/COMPLETED ne sont pas stockés.** `calculateNodeStatuses` les déduit de `NodeProgress.isCompleted` et des prérequis.
4. **L'anti-triche se fait côté serveur.** `QuizAttempt.items` stocke les questions tirées et l'ordre mélangé des options. `correctOptionIndex` n'est jamais envoyé au client. La correction est faite par le serveur, et chaque tentative ne sert qu'une fois et expire après 30 min.
5. **Les mutations passent par des Server Actions**, pas par une API REST. La seule route API est `/api/auth/[...all]` (Better Auth).
6. **Cache avec `cacheComponents` :** le contenu passe par `'use cache'` + `cacheTag('content')`. Les données propres à l'utilisateur sont lues dans des composants async placés sous `<Suspense>`.
7. **Zustand ne sert qu'à l'état d'interface persistant** (filtres par domaine, ratio du split-screen). La base reste la référence pour la progression.
8. **Changements par rapport au schéma de la PARTIE 6 :**
    - ajout du modèle `Lesson`, pour proposer plusieurs vidéos par nœud (le « choix de la leçon ») ;
    - ajout des tables Better Auth ;
    - `QuizAttempt` est relié à `SkillNode` et reçoit les champs anti-triche ;
    - ajout de `NodeProgress.courseViewedAt` et `FlashcardState.lastReviewedAt` ;
    - ajout d'index sur `nodeId` et sur `(userId, dueDate)` ;
    - `prerequisites String[]` est conservé, mais vérifié au moment du seed (ID inconnu, cycle).
9. **Le contenu pédagogique vit dans `content/`** :
    - `skill-tree.ts` pour la structure ;
    - `banks/{ID}.json` pour les quiz et flashcards ;
    - `courses/{ID}.md` pour les fiches.

   On peut ainsi ajouter des packs de contenu sans relire ceux qui existent.

## Plan global (2 à 4 fichiers écrits à la main par étape)

> Ta consigne « Étape 2 » (layout, UI kit, routes) devient les étapes 2 et 3, pour respecter la limite de 4 fichiers. Les fichiers créés par une CLI (shadcn, migrations Prisma) ne comptent pas : ce n'est pas Claude Code qui les écrit.
> Abréviations : `C/` = `src/components/`, `A/` = `src/app/(app)/`.

| # | Étape | Fichiers | Résultat vérifiable |
|---|---|---|---|
| 0 | Préparation manuelle, sans Claude Code | `.env` (DIRECT_URL), `CLAUDE.md`, `git init` | dépôt git + mémoire projet |
| **1** | **Socle données : Prisma 7 + Neon + client DB** | `prisma.config.ts`, `prisma/schema.prisma`, `src/lib/db.ts`, `package.json` | migration `init` appliquée, 11 tables, typecheck OK |
| 2 | UI kit et thème (shadcn/ui, Tailwind v4) | `src/app/globals.css`, `src/app/layout.tsx` (+ fichiers créés par la CLI shadcn) | Button, Card, Badge, Progress, Tabs, Accordion, Dialog, Popover, Tooltip, Skeleton, Sonner ; couleurs de statut et de domaine ; `lang="fr"` |
| 3 | Shell applicatif et structure des routes | `src/lib/routes.ts`, `C/layout/app-nav.tsx`, `A/layout.tsx`, `A/page.tsx` (remplace `src/app/page.tsx`) | sidebar sur desktop, barre du bas sur mobile ; l'accueil affiche le nombre de nœuds (vérifie que Prisma/Neon répond) |
| 4 | Logique métier pure | `src/types/domain.ts`, `src/lib/skill-tree/graph.ts`, `src/lib/srs/sm2.ts` | `calculateNodeStatuses`, prérequis manquants, ordre topologique, placement en couches, `validateSkillGraph`, `calculateSM2` |
| 5 | Tests Vitest (recommandé) | `vitest.config.ts`, `graph.test.ts`, `sm2.test.ts`, `package.json` | `npm test` passe : déblocage avec condition ET, cycles, SM-2, plancher EF à 1.3 |
| 6 | Contenu : structure et contenu de démarrage | `content/types.ts`, `content/skill-tree.ts`, `content/banks/BUT-MAT1.json`, `content/banks/BUT-ALG1.json` | les 15 nœuds avec les prérequis du cahier ; au moins 6 questions et 5 cartes pour 2 nœuds, de quoi tester MAT1 + ALG1 → ALG2 |
| 7 | Seed idempotent | `prisma/seed.ts`, `package.json` (tsx) | `npm run db:seed` se relance sans perte de progression |
| 8 | Auth côté serveur (Better Auth) | `src/lib/auth.ts`, `src/app/api/auth/[...all]/route.ts`, `src/lib/session.ts` | `getSession()` et `requireUser()` ; schéma comparé à la version de Better Auth installée |
| 9 | Auth côté interface | `src/lib/auth-client.ts`, `src/app/(auth)/login/page.tsx`, `C/auth/auth-form.tsx`, `C/auth/user-menu.tsx` | inscription, connexion, déconnexion |
| 10 | Protection des routes | `src/proxy.ts` (le middleware de Next 16), `A/layout.tsx` | redirection vers /login sans session ; menu utilisateur dans le shell |
| 11 | Couche d'accès aux données (DAL) | `src/lib/data/content.ts`, `src/lib/data/progress.ts` | contenu mis en cache ; arbre calculé pour chaque utilisateur |
| 12 | Skill Tree desktop (React Flow) | `C/skill-tree/skill-node.tsx`, `C/skill-tree/skill-tree-flow.tsx`, `C/skill-tree/skill-tree-view.tsx`, `A/tree/page.tsx` | zoom, pan et drag ; 3 états ; popover des prérequis manquants ; meilleur score |
| 13 | Skill Tree mobile + filtres | `src/stores/ui-store.ts`, `C/skill-tree/domain-filter.tsx`, `C/skill-tree/skill-tree-accordion.tsx`, `C/skill-tree/skill-tree-view.tsx` | accordéon par domaine sous 768 px ; filtre par domaine mémorisé |
| 14 | Cours : rendu Markdown | `src/lib/content/markdown.ts`, `C/course/markdown-renderer.tsx`, `content/courses/BUT-MAT1.md` | fiche avec formules KaTeX et code coloré |
| 15 | Cours : vidéo + split-screen | `C/course/video-player.tsx`, `C/course/course-layout.tsx`, `A/nodes/[nodeId]/page.tsx`, `A/nodes/[nodeId]/actions.ts` | split 50/50 ↔ 40/60, onglets [Vidéo] / [Fiche] sur mobile, choix de la leçon |
| 16 | Quiz : logique serveur anti-triche | `src/types/quiz.ts`, `src/lib/quiz/engine.ts`, `src/lib/quiz/engine.test.ts`, `A/nodes/[nodeId]/quiz/actions.ts` | 5 questions tirées, options mélangées, correction par le serveur ; si score ≥ 80 %, les nœuds suivants se débloquent |
| 17 | Quiz : interface + bypass BUT | `C/quiz/quiz-engine.tsx`, `C/quiz/quiz-result.tsx`, `A/nodes/[nodeId]/quiz/page.tsx`, `C/skill-tree/skill-node.tsx` | parcours complet, nouvel essai immédiat, bouton « Évaluer mes acquis » |
| 18 | Flashcards : logique SRS | `A/review/actions.ts`, `src/lib/data/progress.ts`, `A/nodes/[nodeId]/actions.ts`, `A/nodes/[nodeId]/quiz/actions.ts` | SM-2 enregistré en base ; les cartes entrent dans le paquet de révision à l'ouverture du cours ou à la réussite du quiz |
| 19 | Flashcards : interface | `C/flashcards/flashcard.tsx`, `C/flashcards/review-session.tsx`, `A/review/page.tsx` | carte qui se retourne (animation motion), 4 boutons 0/3/4/5, raccourcis clavier |
| 20 | Dashboard | `src/lib/stats.ts`, `C/dashboard/progress-overview.tsx`, `C/dashboard/domain-radar.tsx`, `A/page.tsx` | deux barres BUT / ING, radar des 6 domaines en SVG, nombre de cartes à réviser aujourd'hui |
| 21 | Finitions | `A/loading.tsx`, `A/error.tsx`, `src/app/not-found.tsx` | écrans de chargement et d'erreur propres |
| 22 | Packs de contenu (à répéter, 2 nœuds à chaque passage) | `content/banks/{A}.json`, `content/banks/{B}.json`, `content/courses/{A}.md`, `content/courses/{B}.md` | 12 à 15 questions par nœud, puis `npm run db:seed` |
| 23 | Déploiement Vercel (optionnel) | `package.json`, `README.md` | `prisma migrate deploy` en place, variables documentées |

**Dépendances ajoutées au fil des étapes :**

| Étape | Paquets |
|---|---|
| 1 | `@prisma/adapter-pg`, `dotenv` |
| 2 | shadcn (radix-ui, lucide-react, cva, tailwind-merge) |
| 5 | vitest |
| 7 | tsx |
| 8 | better-auth |
| 13 | zustand |
| 14 | remark-math, rehype-katex, katex, remark-gfm, rehype-highlight |
| 19 | motion |

**Points à trancher plus tard (je te les reposerai le moment venu) :**
- **Étape 6 :** il faudra les vraies URLs YouTube. Je n'en inventerai pas : je mettrai des valeurs provisoires que tu remplaceras.
- **Étape 16, règle du bypass :** le cahier réserve le quiz sans cours aux nœuds BUT. Je propose que, pour un nœud ING, le quiz ne soit accessible qu'après ouverture du cours (`courseViewedAt` renseigné).

## Étape 0 : préparation manuelle (2 min, aucun token consommé)

1. Dans le terminal WebStorm, à la racine du projet, lance :
   ```bash
   git init && git add -A && git commit -m "chore: scaffold initial"
   ```
   Ensuite, fais un commit après chaque étape validée. Si une étape échoue, ça permet de revenir en arrière avec `git checkout .`.
2. Vérifie ta version de Node avec `node -v`. Il faut **au moins 20.19**, une exigence de Prisma 7 ; l'idéal est Node 22 LTS.
3. Sur Neon, ouvre la console, puis **Connect**. Si l'hôte de ton `DATABASE_URL` contient `-pooler`, ajoute dans `.env` une ligne `DIRECT_URL="..."` avec la même URL **sans** `-pooler`. Elle sert aux migrations.
4. Crée `CLAUDE.md` à la racine du projet avec le contenu ci-dessous. Claude Code le charge automatiquement à chaque session (~400 tokens), ce qui évite de répéter ces conventions et d'avoir des écarts :

```markdown
# EngiPath — mémoire projet pour Claude Code

## Stack (versions installées : prioritaires sur tes connaissances)
- Next.js 16.4 App Router (Turbopack), React 19.3, TypeScript strict, Tailwind v4 via le loader `@tailwindcss/turbopack` (pas de PostCSS).
- `cacheComponents: true` : données utilisateur (cookies/headers/Prisma) dans des composants async sous `<Suspense>` ; contenu statique via `"use cache"` + `cacheTag`. Interdit : `export const dynamic` et `revalidate` de segment.
- Middleware Next 16 = `src/proxy.ts`. `params` / `searchParams` sont des Promises.
- Doc Next : ne lire que LE fichier utile dans `node_modules/next/dist/docs/01-app/`, jamais tout le dossier.
- Prisma 7 : `import { PrismaClient } from "@/generated/prisma/client"`, enums via `@/generated/prisma/enums`, jamais `@prisma/client`. Accès DB serveur : `import { prisma } from "@/lib/db"`.
- Mutations = Server Actions (`"use server"`). Seule route API : `/api/auth/[...all]` (Better Auth).

## Règles
- Ne jamais lire ni modifier `.env` (secrets) : demander à l'utilisateur.
- Ne toucher qu'aux fichiers cités dans la demande ; ne jamais éditer `src/generated/` ni `prisma/migrations/`.
- Vérifier chaque tâche avec `npm run typecheck` (+ `npm run lint` pour l'UI).
- Interface en français, identifiants de code en anglais.
```

## Étape 1 : prompt d'exécution (à copier-coller tel quel dans Claude Code)

````text
# ÉTAPE 1 — Socle données : Prisma 7 + Neon (PostgreSQL) + client DB

Contexte : projet Next.js 16.4 (App Router, TypeScript strict) « EngiPath », plateforme d'apprentissage en Skill Tree. Prisma 7.10.0 est déjà installé (prisma + @prisma/client). Le schéma actuel ne contient que le generator `prisma-client` (output ../src/generated/prisma) et une datasource postgresql sans url. Il n'existe pas encore de prisma.config.ts. DATABASE_URL (Neon, poolée) et éventuellement DIRECT_URL (Neon, directe) sont déjà définies dans .env.

Limite tes analyses au périmètre strict des fichiers mentionnés. Ne relis pas l'ensemble du projet. En cas d'erreur de build ou de typage, tu es autorisé à effectuer une recherche ciblée (recherche de symboles, types ou imports directement liés) sans charger de fichiers hors sujet.

## Règles impératives
- Fichiers autorisés, et uniquement eux : `prisma.config.ts` (créer), `prisma/schema.prisma` (remplacer), `src/lib/db.ts` (créer), `package.json` (scripts + dépendances). `prisma/migrations/` et `src/generated/prisma/` sont produits par la CLI : ne les édite jamais à la main.
- Ne lis pas, n'affiche pas et ne modifie pas `.env` (secrets). Si une variable manque, arrête-toi et demande-la moi.
- Prisma 7 : l'URL ne va PAS dans schema.prisma mais dans prisma.config.ts ; le client s'importe depuis "@/generated/prisma/client" (jamais "@prisma/client") et exige un driver adapter.
- N'utilise ni `prisma db push`, ni `prisma migrate reset`, ni `--force` sans mon accord explicite.
- Ne lis ni AGENTS.md ni la doc Next.js : cette étape n'utilise aucune API Next.

## 1. Dépendances
npm install @prisma/adapter-pg@7.10.0
npm install -D dotenv

## 2. Créer `prisma.config.ts` (racine du projet)
```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Configuration de la CLI Prisma 7 (migrate, studio, seed).
 * - DIRECT_URL : connexion Neon directe (hôte sans "-pooler"), recommandée pour les migrations ; repli sur DATABASE_URL.
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
```
Si `defineConfig` rejette une valeur `undefined`, n'ajoute chaque clé de `datasource` que lorsque la variable existe.

## 3. Remplacer intégralement `prisma/schema.prisma` par :
```prisma
// EngiPath — schéma Prisma 7.
// L'URL de connexion vit dans prisma.config.ts (CLI) et src/lib/db.ts (runtime) : ne pas ajouter `url` ici.

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum NodeCategory {
  BUT
  INGENIEUR_IA
}

enum Domain {
  MATHS
  DEV
  RESEAUX
  IA
  ARCHI
  ANGLAIS
}

// ─── Contenu pédagogique : statique, seedé, IDs stables (jamais de cuid) ───

model SkillNode {
  id            String         @id // ex. "BUT-ALG1"
  title         String
  category      NodeCategory
  domain        Domain
  description   String
  prerequisites String[]       @default([]) // IDs de SkillNode, condition ET, validés au seed
  markdownPath  String? // ex. "content/courses/BUT-ALG1.md"
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  lessons       Lesson[]
  flashcards    Flashcard[]
  quizQuestions QuizQuestion[]
  userProgress  NodeProgress[]
  quizAttempts  QuizAttempt[]
}

model Lesson {
  id         String    @id // ex. "BUT-ALG1-L01"
  nodeId     String
  order      Int
  title      String
  youtubeUrl String
  node       SkillNode @relation(fields: [nodeId], references: [id], onDelete: Cascade)

  @@unique([nodeId, order])
}

model Flashcard {
  id         String           @id // ex. "BUT-ALG1-F01"
  nodeId     String
  front      String
  back       String
  node       SkillNode        @relation(fields: [nodeId], references: [id], onDelete: Cascade)
  userStates FlashcardState[]

  @@index([nodeId])
}

model QuizQuestion {
  id                 String    @id // ex. "BUT-ALG1-Q01"
  nodeId             String
  question           String
  options            String[]
  correctOptionIndex Int // index dans `options` (ordre d'origine) — ne jamais exposer au client
  explanation        String
  node               SkillNode @relation(fields: [nodeId], references: [id], onDelete: Cascade)

  @@index([nodeId])
}

// ─── Utilisateurs & authentification (modèles attendus par Better Auth) ───

model User {
  id              String           @id
  name            String
  email           String           @unique
  emailVerified   Boolean          @default(false)
  image           String?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  sessions        Session[]
  accounts        Account[]
  nodeProgresses  NodeProgress[]
  flashcardStates FlashcardState[]
  quizAttempts    QuizAttempt[]
}

model Session {
  id        String   @id
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
}

// ─── Progression : dynamique, liée à l'utilisateur ───
// LOCKED / UNLOCKED / COMPLETED ne sont jamais stockés : ils sont dérivés de
// NodeProgress.isCompleted + des prérequis (calculateNodeStatuses, étape 4).

model NodeProgress {
  id             String    @id @default(cuid())
  userId         String
  nodeId         String
  isCompleted    Boolean   @default(false)
  bestScore      Int       @default(0) // 0..100
  courseViewedAt DateTime?
  completedAt    DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  node           SkillNode @relation(fields: [nodeId], references: [id], onDelete: Cascade)

  @@unique([userId, nodeId])
}

model FlashcardState {
  id             String    @id @default(cuid())
  userId         String
  cardId         String
  interval       Int       @default(0) // en jours
  repetition     Int       @default(0)
  easeFactor     Float     @default(2.5) // plancher 1.3 (SM-2)
  dueDate        DateTime  @default(now())
  lastReviewedAt DateTime?
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  card           Flashcard @relation(fields: [cardId], references: [id], onDelete: Cascade)

  @@unique([userId, cardId])
  @@index([userId, dueDate])
}

model QuizAttempt {
  id          String    @id @default(cuid())
  userId      String
  nodeId      String
  items       Json // { questionId: string; optionOrder: number[] }[] — reste côté serveur (anti-triche)
  answers     Int[]     @default([]) // index choisis, dans l'ordre affiché
  score       Int? // 0..100, null tant que la tentative n'est pas soumise
  passed      Boolean?
  startedAt   DateTime  @default(now())
  submittedAt DateTime?
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  node        SkillNode @relation(fields: [nodeId], references: [id], onDelete: Cascade)

  @@index([userId, nodeId])
}
```

## 4. Créer `src/lib/db.ts` (singleton Prisma côté serveur)
```ts
import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Client Prisma unique côté serveur (Prisma 7 + driver adapter pg, DATABASE_URL poolée Neon).
 * Le singleton global évite d'ouvrir un nouveau pool à chaque rechargement à chaud en dev.
 * Les scripts hors Next (seed) créent leur propre client : "server-only" lève une erreur hors React Server.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL est absente : vérifie le fichier .env");
  }
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```
(N'installe pas le paquet `server-only` : Next 16 le gère nativement, types inclus.)

## 5. `package.json` : ajouter ces scripts (conserver les existants)
"typecheck": "next typegen && tsc --noEmit",
"db:generate": "prisma generate",
"db:migrate": "prisma migrate dev",
"db:deploy": "prisma migrate deploy",
"db:seed": "prisma db seed",
"db:studio": "prisma studio",
"postinstall": "prisma generate"

## 6. Exécution et validation (dans cet ordre, arrête-toi à la première erreur)
npx prisma format
npx prisma validate
npx prisma migrate dev --name init
npx prisma generate
npm run typecheck
npx prisma migrate status

## En cas d'erreur
- P1001 / connexion impossible : n'ouvre pas .env ; signale-moi l'erreur exacte (URL, `-pooler` ou réseau à vérifier de mon côté).
- Shadow database refusée (P3014, permission CREATE DATABASE) : arrête-toi et demande-moi de créer une base « shadow » sur Neon et de renseigner SHADOW_DATABASE_URL.
- `migrate dev` refuse de tourner (environnement non interactif, ou base non vide / drift avec demande de reset) : arrête-toi et donne-moi la commande exacte à lancer moi-même dans le terminal.
- tsc signale des types `pg` manquants : `npm install -D @types/pg`, puis relance `npm run typecheck`.
- Erreur tsc dans `src/generated/prisma` : ne modifie pas ces fichiers ; relance `npx prisma generate`, puis rapporte l'erreur.

## Rapport final attendu (court)
1. Fichiers créés/modifiés (4 maximum).
2. Dépendances installées, avec leur version.
3. Nom du dossier de migration et liste des tables créées.
4. Résultat de validate, migrate status et typecheck : OK, ou erreur exacte.
Aucune autre modification.
````