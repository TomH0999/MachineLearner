# machine-learner

> Plateforme interactive de roadmaps d'apprentissage et d'arbres de compétences basés sur des nœuds dynamiques.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Neon_Postgres-02E693?style=for-the-badge&logo=postgresql&logoColor=white)

---

## À propos

**machine-learner** permet de structurer, visualiser et suivre des parcours de formation interactifs sous forme de graphes orientés (DAG).

- **Roadmaps interactives** : Arbres de compétences gérés avec React Flow.
- **Ressources intégrées** : Prise en charge de contenus vidéo et de fiches au format Markdown.
- **Architecture moderne** : API routes Next.js, typage strict TypeScript et ORM Prisma.

---

## Stack Technique

| Catégorie | Technologie |
| :--- | :--- |
| **Framework** | Next.js (App Router) |
| **Langage** | TypeScript |
| **Styling** | Tailwind CSS |
| **Base de données** | PostgreSQL (Serverless via Neon.tech) |
| **ORM** | Prisma |
| **Graphes / UI** | React Flow (`@xyflow/react`) |
| **Lecteur & Rendu** | `react-player`, `react-markdown` |

---

## Lancement rapide

### 1. Prérequis

- **Node.js** 18+
- Une instance PostgreSQL hébergée sur [Neon.tech](https://neon.tech)

### 2. Installation

bash
Cloner le projet
git clone [https://github.com/ton-compte/machine-learner.git](https://github.com/ton-compte/machine-learner.git)
cd machine-learner/machine-learner

Installer les dépendances
npm install

### 3. Configuration de l'environnement
Crée un fichier .env dans le dossier machine-learner/ :
DATABASE_URL="postgresql://user:password@ep-cool-name.us-east-2.aws.neon.tech/neondb?sslmode=require"

### 4. Base de données & Démarrage
Appliquer le schéma Prisma à la base Neon
npx prisma db push

Lancer le serveur de développement
npm run dev

### Ouvre http://localhost:3000 dans ton navigateur.

---

## Architecture des dossiers

machine-learner/
├── prisma/          # Schéma Prisma et configurations de base
├── src/
│   ├── app/         # Routes Next.js (App Router) & API
│   ├── components/  # Composants UI, Roadmap (React Flow) et Player
│   └── lib/         # Client Prisma et utilitaires
└── .env             # Variables d'environnement (exclu du commit)
