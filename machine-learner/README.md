# EngiPath

EngiPath est une plateforme d'apprentissage en Skill Tree qui couvre le parcours du BUT Informatique jusqu'au cycle ingénieur orienté IA.
Chaque nœud de l'arbre réunit des leçons vidéo, une fiche de cours, un quiz corrigé côté serveur et des flashcards révisées par répétition espacée (SM-2).

**Stack**

- Next.js 16.4 (App Router, Turbopack, `cacheComponents`, `partialPrefetching`) et React 19
- TypeScript strict
- Tailwind CSS v4 (loader `@tailwindcss/turbopack`) + shadcn/ui
- Prisma 7 (driver adapter `@prisma/adapter-pg`) + PostgreSQL sur Neon
- Better Auth (email + mot de passe)
- React Flow (`@xyflow/react`) pour l'arbre, Zustand pour l'état d'interface
- Vitest pour les tests

## Prérequis

- Node.js 24 (voir `engines` dans `package.json`).
- Une base PostgreSQL [Neon](https://neon.tech), avec son URL poolée et son URL directe.

## Installation locale

1. Installer les dépendances (le `postinstall` lance `prisma generate`) :
   ```bash
   npm install
   ```
2. Créer `.env` à la racine du projet avec les variables de la section suivante.
3. Appliquer les migrations : `npm run db:migrate`.
4. Charger le contenu pédagogique : `npm run db:seed`.
5. Lancer le serveur : `npm run dev`, puis ouvrir http://localhost:3000.

## Variables d'environnement

| Variable | Rôle | Forme (exemple sans secret) |
|---|---|---|
| `DATABASE_URL` | URL **poolée** Neon (hôte en `-pooler`), utilisée à l'exécution et par le seed | `postgresql://user:***@ep-xxx-pooler.<région>.aws.neon.tech/neondb?sslmode=require` |
| `DIRECT_URL` | URL **directe** Neon (sans `-pooler`), utilisée par les migrations ; à défaut, la CLI prend `DATABASE_URL` | `postgresql://user:***@ep-xxx.<région>.aws.neon.tech/neondb?sslmode=require` |
| `SHADOW_DATABASE_URL` | Facultative : base « shadow » de `prisma migrate dev`, si Neon refuse de la créer | `postgresql://user:***@ep-xxx.<région>.aws.neon.tech/shadow?sslmode=require` |
| `BETTER_AUTH_SECRET` | Secret de signature des sessions (32 octets aléatoires en base64) | `<chaîne base64 de 44 caractères>` |
| `BETTER_AUTH_URL` | URL publique de l'application | `http://localhost:3000` en local, `https://<projet>.vercel.app` en production |

Générer un secret :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

`.env` contient des secrets : il est ignoré par git (`.env*` dans `.gitignore`).

## Scripts

| Script | Rôle |
|---|---|
| `npm run dev` | Serveur de développement (Turbopack) |
| `npm run build` | Build de production Next.js |
| `npm run typecheck` | Génère les types de routes (`next typegen`), puis `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Tests Vitest : logique métier, moteur de quiz, validation du contenu |
| `npm run db:migrate` | `prisma migrate dev` : crée et applique les migrations en local |
| `npm run db:deploy` | `prisma migrate deploy` : applique les migrations existantes, sans en créer |
| `npm run db:seed` | Upserts idempotents du contenu de `content/` : relançable sans perte de progression |
| `npm run db:studio` | Prisma Studio |
| `npm run content:check-videos` | Vérifie que chaque leçon pointe vers une vidéo YouTube publique et intégrable (lecture seule) |
| `npm run vercel-build` | Build Vercel : en production, migrations + seed puis `next build` ; ailleurs, `next build` seul |

## Contenu pédagogique

```
content/
├── skill-tree.ts      # structure : nœuds, domaines, prérequis (condition ET), leçons vidéo
├── schema.ts          # identifiants des nœuds et types du contenu
├── banks/{ID}.json    # questions de quiz et flashcards d'un nœud
└── courses/{ID}.md    # fiche de cours (Markdown, formules KaTeX, code coloré)
```

Les identifiants sont stables (`BUT-ALG1`, `BUT-ALG1-Q01`, `-F01`, `-L01`) : le seed ne fait que des upserts
et refuse un prérequis inconnu ou un cycle.

Pour ajouter ou modifier du contenu :

1. Éditer les fichiers de `content/`.
2. `npm test` : valide le contenu.
3. `npm run content:check-videos` : vérifie les URLs YouTube.
4. `npm run db:seed` : charge le contenu en base.
5. **Redémarrer `npm run dev`** : le contenu est en cache (`"use cache"` + `cacheLife("max")`), il n'est pas relu à chaud.

## Notes d'architecture

- Mutations par **Server Actions** (`"use server"`) ; la seule route API est `/api/auth/[...all]` (Better Auth).
- **Quiz anti-triche** : le serveur tire les questions, mélange les options, garde l'ordre dans `QuizAttempt.items` et corrige
  lui-même. `correctOptionIndex` n'est jamais envoyé au client ; une tentative ne sert qu'une fois et expire après 30 min.
- Statuts **LOCKED / UNLOCKED / COMPLETED** calculés à partir de `NodeProgress.isCompleted` et des prérequis, jamais stockés.
- **SM-2** pour les flashcards, avec des échéances calculées dans le fuseau `Europe/Paris`.
- **Cache du contenu** : `"use cache"` + `cacheTag("content")` ; les données utilisateur sont lues dans des composants async sous `<Suspense>`.
- **Session** lue en `"use cache: private"` ; `requireUser()` appelle `io()` avant toute donnée utilisateur (contrainte de `partialPrefetching`).
- Jamais de `new Date()` ni de valeur aléatoire avant `io()` dans un Server Component.
- Les fiches Markdown sont lues sur disque à l'exécution : `outputFileTracingIncludes` (`next.config.ts`) les embarque dans les fonctions.
- Zustand ne garde que l'état d'interface (filtres par domaine, ratio du split-screen) ; la base fait foi pour la progression.

## Déploiement sur Vercel

1. Pousser le dépôt sur GitHub.
2. Sur Vercel, importer le dépôt avec **Root Directory = `machine-learner`** (la racine git est le dossier parent).
3. **Build Command = `npm run vercel-build`** : forcer cette valeur (Override) dans les réglages du projet.
4. **Node.js 24** dans les réglages du projet (cohérent avec `engines`).
5. Variables d'environnement de **Production** :
   - `DATABASE_URL` (poolée) et `DIRECT_URL` (directe) ;
   - un **nouveau** `BETTER_AUTH_SECRET`, différent de celui du développement ;
   - `BETTER_AUTH_URL` = l'URL de production (`https://…`).
6. Déployer. En production, `vercel-build` enchaîne `prisma migrate deploy`, `prisma db seed`, puis `next build`.
7. Vérifier :
   - inscription et connexion ;
   - `/tree` ;
   - une fiche avec ses formules (par exemple `/nodes/BUT-MAT1`) ;
   - un quiz ;
   - `/review`.

> **Previews.** Elles partagent la base de production : `vercel-build` n'y lance ni migration ni seed (`VERCEL_ENV` ≠ `production`).
> L'authentification n'y fonctionne que si `BETTER_AUTH_URL` (variables de l'environnement Preview) correspond à l'URL de la preview.

> **Fuseau horaire.** `TZ` est une variable réservée sur Vercel : le fuseau `Europe/Paris` des échéances SM-2 est donc fixé dans le code.

> **Dépendances de build.** `prisma`, `tsx` et `dotenv` sont des devDependencies utilisées par `vercel-build` :
> ne pas désactiver leur installation (pas de `NODE_ENV=production` ni de `NPM_CONFIG_PRODUCTION` au build).

## Sécurité des dépendances

Résultat de `npm audit --omit=dev` au 8 octobre 2026 : **15 vulnérabilités** (11 hautes, 4 basses, aucune modérée ni critique).
Aucune correction n'a été appliquée : `npm audit fix --force` imposerait des retours en arrière majeurs
(prisma 6, shadcn 1, rehype-katex 1, remark-math 3).

| Sévérité | Paquets | Origine | Exposition |
|---|---|---|---|
| Haute | `prisma`, `@prisma/config`, `deepmerge-ts`, `mysql2` | CLI Prisma (pair de `@prisma/client` et de Better Auth) | Exécutée au build et en local ; `mysql2` ne sert qu'aux bases MySQL |
| Haute | `shadcn`, `@shadcn/registry`, `ts-morph`, `@ts-morph/common`, `fast-glob`, `micromatch`, `braces` | CLI shadcn | L'application n'importe que `shadcn/tailwind.css` |
| Basse | `katex` (copies 0.18 imbriquées), `micromark-extension-math`, `remark-math`, `rehype-katex` | Rendu des formules | Ne traite que les fiches du dépôt |

À revoir lors des montées de version de Prisma, shadcn et rehype-katex / remark-math.
