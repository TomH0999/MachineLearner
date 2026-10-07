# **ÉCOSYSTÈME COMPLET D'APPRENTISSAGE & SPÉCIFICATIONS**

# **DU BUT INFORMATIQUE VERS LE CYCLE INGÉNIEUR & IA**

---

# **SOMMAIRE**

1. **PARTIE 1 :** Le Plan d'Apprentissage "Major de Promo" (BUT \-\> Ingénieur/IA)  
2. **PARTIE 2 :** Guide des Ressources YouTube Incontournables  
3. **PARTIE 3 :** Prompt Générateur de Fiches et Sous-Plans de Révision  
4. **PARTIE 4 :** Prompt d'Initialisation pour IDE / LLM (Cursor & Claude 3.5 Sonnet)  
5. **PARTIE 5 :** Cahier des Charges Technique et Fonctionnel V2 (EngiPath)  
6. **PARTIE 6 :** Schéma de Base de Données Prisma (`schema.prisma`)  
7. **PARTIE 7 :** Implémentations Utilitaires TypeScript (`calculateNodeStatuses` & `calculateSM2`)  
8. **PARTIE 8 :** Script de Seed Prisma (`seed.ts`)

---

# **PARTIE 1 : LE PLAN D'APPRENTISSAGE "MAJOR DE PROMO"**

L'excellence en cycle ingénieur exige une transition d'une logique d'application (BUT) à une logique de conception et de modélisation mathématique. Voici la progression stricte à respecter.

## **Phase 1 : Consolidation Experte du BUT (L'Exécution Parfaite)**

Avant de théoriser, maîtrise l'ingénierie logicielle fondamentale.

* **Algorithmique & Structures de Données :** Maîtrise absolue des arbres (B-Trees, AVL), graphes (Dijkstra, A\*), tables de hachage, et de la complexité temporelle/spatiale (notation Big-O).  
* **Paradigmes de Programmation :** Programmation Orientée Objet avancée (Design Patterns du GoF, principes SOLID) et initiation à la programmation fonctionnelle.  
* **Ingénierie Logicielle :** Tests unitaires/d'intégration (TDD), CI/CD (GitLab CI, GitHub Actions), conteneurisation (Docker).  
* **Bases de Données :** Optimisation de requêtes SQL (indexation, plans d'exécution), modélisation relationnelle avancée, et introduction au NoSQL (MongoDB, Redis).

## **Phase 2 : Le Pont Mathématique et Théorique (La Barrière de l'Ingénieur)**

C'est ici que se fait la différence entre un technicien et un ingénieur IA.

* **Mathématiques Discrètes :** Logique booléenne, théorie des ensembles, combinatoire, théorie des graphes mathématique, automates et langages formels.  
* **Algèbre Linéaire (Le moteur de l'IA) :** Vecteurs, matrices, espaces vectoriels, déterminants, valeurs propres et vecteurs propres (Eigenvalues/Eigenvectors), décomposition en valeurs singulières (SVD).  
* **Analyse Mathématique (Calculus) :** Fonctions à plusieurs variables, dérivées partielles, gradients (fondamental pour la descente de gradient en IA), intégrales multiples, séries de Taylor.  
* **Probabilités et Statistiques :** Variables aléatoires, lois de probabilité (Normale, Poisson, Binomiale), espérance, variance, théorème de Bayes, chaînes de Markov.

## **Phase 3 : Spécialisation Ingénierie IA (La Longueur d'Avance)**

À n'aborder qu'une fois la Phase 2 validée.

* **Machine Learning Classique (ML) :** Régression (linéaire, logistique), classification (SVM, Random Forests, KNN), clustering (K-Means), PCA (réduction de dimensionnalité).  
* **Deep Learning Fundamental :** Architecture d'un perceptron multicouche (MLP), algorithme de rétropropagation (Backpropagation), fonctions d'activation, fonctions de perte.  
* **Architectures Modernes :** Réseaux de neurones convolutifs (CNN) pour la vision, réseaux récurrents (RNN/LSTM) et Transformers pour le NLP.  
* **Architecture Matérielle :** Fonctionnement CPU vs GPU, hiérarchie mémoire, parallélisme et calcul distribué (CUDA basique).

---

# **PARTIE 2 : RESSOURCES YOUTUBE INCONTOURNABLES**

Catégorie | Chaîne / Créateur | Langue | Focus Principal  
\--- | \--- | \--- | \---  
Socle BUT & Code | Fireship | EN | Concepts d'architecture, langages et frameworks expliqués en 100 secondes.  
Socle BUT & Code | NeetCode | EN | Explication visuelle et code des algorithmes et structures de données.  
Socle BUT & Code | Xavki | FR | DevOps pur, Linux, Docker, CI/CD pour maîtriser l'infrastructure.  
Avance Maths | 3Blue1Brown | EN | Indispensable. Séries Essence of Linear Algebra et Essence of Calculus. Visualisation des concepts abstraits.  
Avance Maths | Maths et Tiques (Yvan Monka) | FR | Rattrapage académique étape par étape sur les probabilités, matrices et l'analyse.  
Avance IA & ML | StatQuest with Josh Starmer | EN | Indispensable. Déconstruction visuelle et pas-à-pas des algorithmes de Machine Learning, Statistiques et PCA.  
Avance IA & ML | Machine Learnia | FR | Séries complètes sur le Machine Learning et Deep Learning en Python (Numpy, Pandas, Scikit-Learn).  
Avance IA & ML | Andrej Karpathy | EN | Cours magistraux pour comprendre comment construire un réseau de neurones (LLM) de zéro.

---

# **PARTIE 3 : PROMPT GÉNÉRATEUR DE FICHES ET SOUS-PLANS**

**Agis en tant que professeur d'école d'ingénieur spécialisé en Informatique et Intelligence Artificielle.** Mon objectif est de maîtriser parfaitement la notion suivante : `[INSERER LA NOTION ICI, ex: "La Descente de Gradient" ou "Les Arbres AVL"]`.Génère une réponse structurée exactement selon le format suivant :**1\. SOUS-PLAN D'APPRENTISSAGE**

* Découpe cette notion en 3 à 5 sous-chapitres logiques, du plus simple au plus complexe.  
* Indique les prérequis absolus à maîtriser avant d'étudier cette notion.

**2\. SYNTHÈSE CONCEPTUELLE (FICHE DE RÉVISION)**

* Explique le concept comme si j'étais un étudiant en BUT Informatique (pragmatique), puis élève le niveau vers l'abstraction mathématique (ingénieur).  
* Utilise des analogies claires.

**3\. FORMULES MATHÉMATIQUES ET THÉORIE**

* Fournis les équations fondamentales liées à cette notion en utilisant le formatage LaTeX.  
* Explique chaque variable de l'équation.

**4\. EXEMPLE PRATIQUE / CODE**

* Fournis une implémentation minimale et propre (Clean Code) en Python ou C++ illustrant le concept.  
* Commente les étapes clés de l'algorithme.

**5\. PIÈGES ET QUESTIONS D'ENTRETIEN**

* Liste les 3 erreurs de compréhension les plus fréquentes sur ce sujet.  
* Pose-moi 2 questions de type "Entretien technique / Examen d'ingénieur" pour tester ma compréhension immédiate.

---

# **PARTIE 4 : PROMPT D'INITIALISATION POUR CURSOR / CLAUDE 3.5 SONNET**

Tu es un ingénieur Full-Stack Senior expert en Next.js (App Router), React, TailwindCSS, TypeScript et Prisma (PostgreSQL).Je veux que tu me codes la structure complète et les composants clés d'une plateforme d'apprentissage gamifiée appelée "EngiPath", conçue spécifiquement pour accompagner un étudiant d'un BUT Informatique vers un diplôme d'Ingénieur en IA.Consulte et applique rigoureusement le cahier des charges ci-dessous (Section PARTIE 5 de ce document).Génère en priorité :

1. Le fichier `schema.prisma` complet répondant à ces contraintes de relations.  
2. Les fonctions utilitaires `calculateNodeStatuses` et `calculateSM2`.  
3. Le composant `SkillTree.tsx` utilisant React Flow (desktop) et la vue responsive accordéon (mobile).  
4. Le composant `CourseViewer.tsx` avec layout split-screen vidéo/markdown.  
5. Le composant `QuizEngine.tsx` avec tirage au sort aléatoire de 5 questions et scoring anti-triche.

Assure-toi que le code soit typé strictly, modulaire et respecte les normes Next.js App Router.

---

# **PARTIE 5 : CAHIER DES CHARGES TECHNIQUE ET FONCTIONNEL (V2)**

## **1\. Vision du Produit et Objectifs Académiques**

L'application **EngiPath** est une plateforme d'apprentissage web gamifiée sous forme d'arbre de compétences (Skill Tree / DAG). Elle est conçue pour accompagner un étudiant en BUT Informatique visant l'excellence académique (Major de promotion) et la préparation directe à un cursus Ingénieur (spécialité Informatique / IA).

**Principes clés de fonctionnement :**

1. **Déblocage conditionnel strict :** Les modules du Cursus Ingénieur / IA sont verrouillés par défaut. Un nœud verrouillé ne devient accessible que si tous ses prérequis (condition ET) ont été validés par l'utilisateur (score au quiz \>= 80 %).  
2. **Mode Évaluation de positionnement (Bypass) :** L'utilisateur peut tenter directement le quiz d'un nœud du BUT sans consulter le cours pour valider ses acquis relatifs et débloquer rapidement les branches avancées.  
3. **Séparation Stricte Contenu / Progression :** Le contenu pédagogique (leçons, banques de quiz, flashcards) est statique et immutable. La progression (scores, état des nœuds, états SM-2 des cartes) est dynamique et liée à l'utilisateur.

## **2\. Architecture Technique et Stack**

* **Framework Frontend :** Next.js (App Router, Server & Client Components), TypeScript (Typage strict `strict: true`).  
* **Styling & Design System :** Tailwind CSS, composants `shadcn/ui` (Dialog, Accordion, Progress, Tabs, Card, Badge, Button), Lucide Icons, Framer Motion (animations UI/UX).  
* **Graph & Skill Tree :** `@xyflow/react` (React Flow) pour le rendu interactif sur Desktop.  
* **Base de Données & ORM :** PostgreSQL \+ Prisma ORM (ou Supabase).  
* **Gestion d'État Client :** Zustand avec persistance local/sync serveur.  
* **Rendu Média & Mathématiques :**  
  * Vidéo : `react-player` (intégration API YouTube).  
  * Fiches/Markdown : `react-markdown` \+ `remark-math` \+ `rehype-katex` pour le rendu LaTeX.  
* **Algorithme d'apprentissage :** Implémentation du modèle SM-2 (Spaced Repetition System) pour la révision des flashcards.

## **3\. Arborescence et Dépendances du Plan d'Apprentissage**

image : machine-learner/arborescence.png

**SOCLE 1 : BUT INFORMATIQUE (Débloqué au départ)**

* `BUT-ALG1` : Algorithmique & Structures de Données de Base  
* `BUT-DEV1` : Programmation & POO (C/C++, Java, Python)  
* `BUT-BDD1` : Bases de Données Relationnelles & SQL  
* `BUT-RES1` : Réseaux, CLI Linux & Administration Système  
* `BUT-WEB1` : Développement Web, Git & Génie Logiciel  
* `BUT-MAT1` : Mathématiques du BUT (Logique, Ensembles, Matrices de base)

**SOCLE 2 : PASSERELLE CURSUS INGÉNIEUR & IA (Verrouillé \- Déblocage Conditionnel)**

* `ING-MAT2` : Algèbre Linéaire Avancée (Prérequis : `BUT-MAT1`)  
* `ING-MAT3` : Analyse Multivariée & Optimisation (Prérequis : `ING-MAT2`)  
* `ING-MAT4` : Probabilités Avancées & Statistiques Inférentielles (Prérequis : `BUT-MAT1`)  
* `ING-ALG2` : Mathématiques Discrètes & Théorie des Langages (Prérequis : `BUT-ALG1` ET `BUT-MAT1`)  
* `ING-ALG3` : Algorithmique Avancée & Graphes (Prérequis : `ING-ALG2`)  
* `ING-IA1` : Fondations du Machine Learning (Prérequis : `ING-MAT2` ET `ING-MAT3` ET `ING-MAT4` ET `BUT-DEV1`)  
* `ING-IA2` : Deep Learning & Réseaux de Neurones (Prérequis : `ING-IA1`)  
* `ING-ARCH1` : Architecture Logicielle & Systèmes Distribués (Prérequis : `BUT-DEV1` ET `BUT-RES1`)  
* `ING-ENG1` : Anglais Technique & Préparation TOEIC 900+ (Prérequis : Aucun)

## **4\. Spécifications Fonctionnelles Détaillées**

### **4.1 Visualisation du Skill Tree & Responsive Layout**

* **Desktop (\>= 768 px) :** Vue interactive via React Flow (zoom, pan, drag).  
  * Nœuds reliés par des arêtes orientées.  
  * États des nœuds :  
    * `LOCKED` : Opacité réduite, icône de cadenas. Au clic, ouverture d'un popover affichant la liste des prérequis manquants.  
    * `UNLOCKED` : Contour lumineux/actif. Prêt à être étudié ou évalué.  
    * `COMPLETED` : Badge vert/doré avec affichage du meilleur score au quiz (ex: 90 %).  
* **Mobile (\< 768 px) :** Fallback Responsive sous forme d'Accordéon par Domaine (Maths, Dev, IA, System). Les modules y sont listés de façon séquentielle avec des badges de statut explicites et le verrouillage dynamique.  
* **Filtres :** Barre d'outils permettant de filtrer l'affichage par domaine d'apprentissage.

### **4.2 Espace de Cours (Dual View & Split Screen)**

* **Desktop :** Split-screen ajustable (50/50 ou 40/60).  
  * Gauche : Lecteur vidéo YouTube (`react-player`) avec choix de la leçon/playlist.  
  * Droite : Zone de cours Markdown enrichie avec formules mathématiques KaTeX et blocs de code syntaxiquement colorés.  
* **Mobile :** Basculement par onglets `[Vidéo]` | `[Fiche de Cours]`.

### **4.3 Module Flashcards & Algorithme SRS (SM-2)**

Chaque carte présente une question au recto et une réponse/explication au verso. L'utilisateur évalue la difficulté de rappel via 4 boutons : Nul (0), Difficile (3), Bon (4), Facile (5).

Algorithme SM-2 à implémenter :  
Pour chaque carte révisée, recalculer le facteur de facilité (\$EF\$), l'intervalle (\$I\$) et la date de prochaine révision (\$Due\$) :

1. Si la note \$q \< 3\$ : Repétitions \= 0, \$I \= 1\$.  
2. Si la note \$q \\ge 3\$ :  
   * Si Repétitions \= 0 \$\\rightarrow I \= 1\$  
   * Si Repétitions \= 1 \$\\rightarrow I \= 6\$  
   * Si Repétitions \> 1 \$\\rightarrow I \= \\text{arrondi}(I\_{\\text{précédent}} \\times EF)\$  
   * Repétitions \= Repétitions \+ 1  
3. Mise à jour du facteur de facilité :  
   \$\$EF' \= EF \+ (0.1 \- (5 \- q) \\times (0.08 \+ (5 \- q) \\times 0.02))\$\$  
   *(Avec un seuil minimal de \$EF \\ge 1.3\$)*.

### **4.4 Moteur de Quiz & Système Anti-Triche**

* **Banque de questions :** Chaque nœud contient une banque statique d'au moins 10 à 15 questions.  
* **Génération d'une session :** Sélection aléatoire de 5 questions dans la banque à chaque tentative. Ordre des choix de réponse mélangé.  
* **Validation :** Calcul du score final sur 100 %.  
  * **Si Score \>= 80 % :** Le nœud passe à l'état `COMPLETED`. L'application réévalue immédiatement le graphe pour passer au statut `UNLOCKED` tous les nœuds dont l'ensemble des prérequis devenus valides le permet.  
  * **Si Score \< 80 % :** Échec. Possibilité de réessayer immédiatement avec une nouvelle série de questions mélangées.

### **4.5 Dashboard de Progression & Analytics**

* **Double Barre de Progression :**  
  1. % de complétion du Socle BUT (Nœuds BUT validés / Total Nœuds BUT).  
  2. % de complétion de la Passerelle Ingénieur/IA (Nœuds ING validés / Total Nœuds ING).  
* **Radar Chart (Graphe Araignée) :** Progression par domaine (Maths, Dev, Système/Réseaux, IA, Architecture, Anglais).  
* **Indicateurs SRS :** Nombre de flashcards dues aujourd'hui selon l'algorithme SM-2.

---

# **PARTIE 6 : SCHÉMA DE BASE DE DONNÉES PRISMA (`schema.prisma`)**

datasource db {

  provider \= "postgresql"

  url      \= env("DATABASE\_URL")

}

generator client {

  provider \= "prisma-client-js"

}

enum NodeCategory {

  BUT

  INGENIEUR\_IA

}

enum Domain {

  MATHS

  DEV

  RESEAUX

  IA

  ARCHI

  ANGLAIS

}

model SkillNode {

  id            String         @id

  title         String

  category      NodeCategory

  domain        Domain

  description   String

  prerequisites String\[\]

  youtubeUrl    String?

  markdownPath  String?

  

  flashcards    Flashcard\[\]

  quizQuestions QuizQuestion\[\]

  userProgress  NodeProgress\[\]

  createdAt     DateTime       @default(now())

  updatedAt     DateTime       @updatedAt

}

model Flashcard {

  id          String           @id @default(cuid())

  nodeId      String

  node        SkillNode        @relation(fields: \[nodeId\], references: \[id\], onDelete: Cascade)

  front       String

  back        String

  userStates  FlashcardState\[\]

}

model QuizQuestion {

  id                 String    @id @default(cuid())

  nodeId             String

  node               SkillNode @relation(fields: \[nodeId\], references: \[id\], onDelete: Cascade)

  question           String

  options            String\[\]

  correctOptionIndex Int

  explanation        String

}

model User {

  id              String           @id @default(cuid())

  email           String           @unique

  name            String?

  nodeProgresses  NodeProgress\[\]

  flashcardStates FlashcardState\[\]

  quizAttempts    QuizAttempt\[\]

  createdAt       DateTime         @default(now())

}

model NodeProgress {

  id          String    @id @default(cuid())

  userId      String

  nodeId      String

  user        User      @relation(fields: \[userId\], references: \[id\], onDelete: Cascade)

  node        SkillNode @relation(fields: \[nodeId\], references: \[id\], onDelete: Cascade)

  

  isCompleted Boolean   @default(false)

  bestScore   Int       @default(0)

  completedAt DateTime?

  @@unique(\[userId, nodeId\])

}

model FlashcardState {

  id          String    @id @default(cuid())

  userId      String

  cardId      String

  user        User      @relation(fields: \[userId\], references: \[id\], onDelete: Cascade)

  card        Flashcard @relation(fields: \[cardId\], references: \[id\], onDelete: Cascade)

  interval    Int       @default(0)

  repetition  Int       @default(0)

  easeFactor  Float     @default(2.5)

  dueDate     DateTime  @default(now())

  @@unique(\[userId, cardId\])

}

model QuizAttempt {

  id        String   @id @default(cuid())

  userId    String

  nodeId    String

  user      User     @relation(fields: \[userId\], references: \[id\], onDelete: Cascade)

  score     Int

  passed    Boolean

  createdAt DateTime @default(now())

}

---

# **PARTIE 7 : IMPLÉMENTATIONS UTILITAIRES TYPESCRIPT**

export type NodeStatus \= 'LOCKED' | 'UNLOCKED' | 'COMPLETED';

export interface RawNode {

  id: string;

  title: string;

  category: 'BUT' | 'INGENIEUR\_IA';

  domain: 'MATHS' | 'DEV' | 'RESEAUX' | 'IA' | 'ARCHI' | 'ANGLAIS';

  description: string;

  prerequisites: string\[\];

}

export interface UserNodeProgress {

  nodeId: string;

  isCompleted: boolean;

  bestScore: number;

}

export interface CalculatedNode extends RawNode {

  status: NodeStatus;

  bestScore: number;

}

export function calculateNodeStatuses(

  nodes: RawNode\[\],

  userProgresses: UserNodeProgress\[\]

): CalculatedNode\[\] {

  const progressMap \= new Map\<string, UserNodeProgress\>(

    userProgresses.map((p) \=\> \[p.nodeId, p\])

  );

  const completedSet \= new Set\<string\>(

    userProgresses.filter((p) \=\> p.isCompleted).map((p) \=\> p.nodeId)

  );

  return nodes.map((node) \=\> {

    const userProg \= progressMap.get(node.id);

    const isCompleted \= userProg?.isCompleted ?? false;

    const bestScore \= userProg?.bestScore ?? 0;

    if (isCompleted) {

      return { ...node, status: 'COMPLETED', bestScore };

    }

    const allPrereqsMet \= node.prerequisites.every((prereqId) \=\>

      completedSet.has(prereqId)

    );

    const status: NodeStatus \= allPrereqsMet ? 'UNLOCKED' : 'LOCKED';

    return { ...node, status, bestScore };

  });

}

export interface SM2Input {

  quality: number;

  interval: number;

  repetition: number;

  easeFactor: number;

}

export interface SM2Output {

  interval: number;

  repetition: number;

  easeFactor: number;

  dueDate: Date;

}

export function calculateSM2(input: SM2Input): SM2Output {

  const { quality } \= input;

  let { interval, repetition, easeFactor } \= input;

  if (quality \< 3\) {

    repetition \= 0;

    interval \= 1;

  } else {

    if (repetition \=== 0\) {

      interval \= 1;

    } else if (repetition \=== 1\) {

      interval \= 6;

    } else {

      interval \= Math.round(interval \* easeFactor);

    }

    repetition \+= 1;

  }

  easeFactor \= easeFactor \+ (0.1 \- (5 \- quality) \* (0.08 \+ (5 \- quality) \* 0.02));

  if (easeFactor \< 1.3) {

    easeFactor \= 1.3;

  }

  const dueDate \= new Date();

  dueDate.setDate(dueDate.getDate() \+ interval);

  return { interval, repetition, easeFactor, dueDate };

}

---

# **PARTIE 8 : SCRIPT DE SEED PRISMA (`seed.ts`)**

t  
import { PrismaClient, NodeCategory, Domain } from '@prisma/client';

const prisma \= new PrismaClient();

async function main() {  
console.log('--- Nettoyage de la base de données \---');  
await prisma.quizAttempt.deleteMany();  
await prisma.flashcardState.deleteMany();  
await prisma.nodeProgress.deleteMany();  
await prisma.quizQuestion.deleteMany();  
await prisma.flashcard.deleteMany();  
await prisma.skillNode.deleteMany();

console.log('--- Création des Nœuds du Skill Tree \---');

await prisma.skillNode.create({  
data: {  
id: 'BUT-ALG1',  
title: 'Algorithmique & Structures de Données',  
category: NodeCategory.BUT,  
domain: Domain.DEV,  
description: 'Piles, Files, Listes chaînées, Arbres binaires, Tri et complexité.',  
prerequisites: \[\],  
youtubeUrl: 'Playlist YouTube BUT-ALG1',  
markdownPath: '/content/but-alg1.md',  
},  
});

await prisma.skillNode.create({  
data: {  
id: 'BUT-MAT1',  
title: 'Mathématiques du BUT',  
category: NodeCategory.BUT,  
domain: Domain.MATHS,  
description: 'Logique, Ensembles, Calcul matriciel de base et Probabilités simples.',  
prerequisites: \[\],  
youtubeUrl: 'Playlist YouTube BUT-MAT1',  
markdownPath: '/content/but-mat1.md',  
},  
});

await prisma.skillNode.create({  
data: {  
id: 'BUT-DEV1',  
title: 'Programmation & POO',  
category: NodeCategory.BUT,  
domain: Domain.DEV,  
description: 'Pointeurs, Gestion mémoire, Encapsulation, Héritage, Polymorphisme.',  
prerequisites: \[\],  
youtubeUrl: 'Playlist YouTube BUT-DEV1',  
markdownPath: '/content/but-dev1.md',  
},  
});

await prisma.skillNode.create({  
data: {  
id: 'BUT-RES1',  
title: 'Réseaux & Système',  
category: NodeCategory.BUT,  
domain: Domain.RESEAUX,  
description: 'Modèle OSI, TCP/IP, Adressage IP, CLI Linux, Bash et Processus.',  
prerequisites: \[\],  
youtubeUrl: 'Playlist YouTube BUT-RES1',  
markdownPath: '/content/but-res1.md',  
},  
});

await prisma.skillNode.create({  
data: {  
id: 'ING-MAT2',  
title: 'Algèbre Linéaire Avancée',  
category: NodeCategory.INGENIEUR\_IA,  
domain: Domain.MATHS,  
description: 'Espaces vectoriels, Valeurs/Vecteurs propres, Diagonalisation, SVD.',  
prerequisites: \['BUT-MAT1'\],  
youtubeUrl: 'Playlist YouTube ING-MAT2',  
markdownPath: '/content/ing-mat2.md',  
},  
});

await prisma.skillNode.create({  
data: {  
id: 'ING-IA1',  
title: 'Fondations du Machine Learning',  
category: NodeCategory.INGENIEUR\_IA,  
domain: Domain.IA,  
description: 'Apprentissage supervisé/non-supervisé, Régressions, Random Forests, SVM.',  
prerequisites: \['ING-MAT2', 'BUT-DEV1'\],  
youtubeUrl: 'Playlist YouTube ING-IA1',  
markdownPath: '/content/ing-ia1.md',  
},  
});

console.log('--- Création des Flashcards d exemples \---');  
await prisma.flashcard.createMany({  
data: \[  
{  
nodeId: 'BUT-ALG1',  
front: 'Quelle est la complexité temporelle moyenne de la recherche dans une Hash Table ?',  
back: 'O(1) en temps moyen. O(n) dans le pire des cas en cas de collisions multiples.',  
},  
{  
nodeId: 'BUT-ALG1',  
front: 'Quelle est la différence fondamentale entre une Pile (Stack) et une File (Queue) ?',  
back: 'La Pile suit le principe LIFO (Last In First Out). La File suit le principe FIFO (First In First Out).',  
},  
{  
nodeId: 'ING-IA1',  
front: 'Qu est-ce que le surapprentissage (Overfitting) ?',  
back: 'Un phénomène où le modèle apprend "par cœur" le bruit des données d entraînement, entraînant une mauvaise généralisation sur les nouvelles données.',  
},  
\],  
});

console.log('--- Création des Quiz d exemples \---');  
await prisma.quizQuestion.createMany({  
data: \[  
{  
nodeId: 'BUT-ALG1',  
question: 'Quelle structure de données repose sur la règle LIFO ?',  
options: \['File (Queue)', 'Pile (Stack)', 'Liste Chaînée', 'Arbre Binaire'\],  
correctOptionIndex: 1,  
explanation: 'La Pile (Stack) fonctionne selon la règle Last-In First-Out.',  
},  
{  
nodeId: 'BUT-ALG1',  
question: 'Pire complexité de QuickSort sans optimisation de pivot ?',  
options: \['O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'\],  
correctOptionIndex: 3,  
explanation: 'QuickSort peut dégrader en O(n²) si le tableau est déjà trié et le pivot mal choisi.',  
},  
{  
nodeId: 'ING-IA1',  
question: 'Quelle fonction de perte est couramment utilisée pour une régression linéaire ?',  
options: \['Binary Cross-Entropy', 'Mean Squared Error (MSE)', 'Categorical Cross-Entropy', 'Hinge Loss'\],  
correctOptionIndex: 1,  
explanation: 'La MSE mesure l écart quadratique moyen entre les prédictions et les valeurs réelles.',  
},  
\],  
});

console.log('--- Seed terminé avec succès \! \---');  
}

main()  
.catch((e) \=\> {  
console.error(e);  
process.exit(1);  
})  
.finally(async () \=\> {  
await prisma.\$disconnect();  
});

[image1]: <data:image/png;base64,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>