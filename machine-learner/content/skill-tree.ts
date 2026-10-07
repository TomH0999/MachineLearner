import type { SeedNode } from "./schema";

/**
 * Structure complète du Skill Tree (15 nœuds).
 * Couverture exhaustive des notions du BUT et du cycle Ingénieur / IA.
 */
export const SKILL_TREE: readonly SeedNode[] = [
  // ─── SOCLE 1 : BUT INFORMATIQUE ───
  {
    id: "BUT-ALG1",
    title: "Algorithmique & Structures de Données de Base",
    category: "BUT",
    domain: "DEV",
    description:
        "Complexité (notation O), piles, files, listes chaînées, arbres binaires, tables de hachage, tris et recherche.",
    prerequisites: [],
    markdownPath: "content/courses/BUT-ALG1.md",
    lessons: [
      {
        id: "BUT-ALG1-L01",
        order: 1,
        title: "Analyse de complexité spatio-temporelle (Big O Notation) — Fireship (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=g2o22C3CRfU",
      },
      {
        id: "BUT-ALG1-L02",
        order: 2,
        title: "Piles, Files, Listes chaînées et Hash Tables — NeetCode (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=8hly31xKLI0",
      },
      {
        id: "BUT-ALG1-L03",
        order: 3,
        title: "Arbres binaires de recherche (BST) et Parcours BFS/DFS — freeCodeCamp (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=fAAZ2rCsw18",
      },
      {
        id: "BUT-ALG1-L04",
        order: 4,
        title: "Algorithmes de tri avancés (QuickSort, MergeSort, HeapSort) — mycodeschool (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=COk73cpQbFQ",
      },
    ],
  },
  {
    id: "BUT-DEV1",
    title: "Programmation & POO (C/C++, Java, Python)",
    category: "BUT",
    domain: "DEV",
    description:
        "Pointeurs et mémoire, encapsulation, héritage, polymorphisme, principes SOLID et design patterns de base.",
    prerequisites: [],
    markdownPath: "content/courses/BUT-DEV1.md",
    lessons: [
      {
        id: "BUT-DEV1-L01",
        order: 1,
        title: "Gestion de la mémoire et pointeurs en C / C++ — mycodeschool (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=zuegQmMdy8M",
      },
      {
        id: "BUT-DEV1-L02",
        order: 2,
        title: "Les fondamentaux de la POO (Encapsulation, Héritage, Polymorphisme) — Mosh (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=pTB0EiLXUC8",
      },
      {
        id: "BUT-DEV1-L03",
        order: 3,
        title: "Les Principes SOLID en programmation orientée objet — Fireship (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=C3T6LpS_m4s",
      },
      {
        id: "BUT-DEV1-L04",
        order: 4,
        title: "Initiation à la programmation fonctionnelle et Lambdas — freeCodeCamp (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=e-5obm1G_FY",
      },
    ],
  },
  {
    id: "BUT-BDD1",
    title: "Bases de Données Relationnelles & SQL",
    category: "BUT",
    domain: "DEV",
    description: "Modélisation relationnelle, normalisation, SQL (jointures, agrégats), index et transactions.",
    prerequisites: [],
    markdownPath: "content/courses/BUT-BDD1.md",
    lessons: [
      {
        id: "BUT-BDD1-L01",
        order: 1,
        title: "Modélisation E/A et Formes Normales (1NF à 3NF) — freeCodeCamp (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=ztHopE5Wnpc",
      },
      {
        id: "BUT-BDD1-L02",
        order: 2,
        title: "SQL Avancé : Jointures, Aggrégations et Sous-requêtes — freeCodeCamp (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
      },
      {
        id: "BUT-BDD1-L03",
        order: 3,
        title: "Optimisation des requêtes, Indexation B-Tree et Transactions ACID — Fireship (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=Qp_4M_N-JdY",
      },
      {
        id: "BUT-BDD1-L04",
        order: 4,
        title: "Introduction aux bases NoSQL (Document, Clé-Valeur, Graphe) — Fireship (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=0buKQHokLK8",
      },
    ],
  },
  {
    id: "BUT-RES1",
    title: "Réseaux, CLI Linux & Administration Système",
    category: "BUT",
    domain: "RESEAUX",
    description: "Modèle OSI, TCP/IP, adressage IP, ligne de commande Linux, Bash, processus et services.",
    prerequisites: [],
    markdownPath: "content/courses/BUT-RES1.md",
    lessons: [
      {
        id: "BUT-RES1-L01",
        order: 1,
        title: "Le Modèle OSI et la suite TCP/IP expliqués — NetworkChuck (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=vv4y_uOneC0",
      },
      {
        id: "BUT-RES1-L02",
        order: 2,
        title: "Adressage IPv4, Masques de sous-réseau (Subnetting) et CIDR — NetworkChuck (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=s_Ntt6eTn94",
      },
      {
        id: "BUT-RES1-L03",
        order: 3,
        title: "Masterclass Terminal Linux & Administration Système — Xavki (FR)",
        youtubeUrl: "https://www.youtube.com/watch?v=S2fIipA3Iwc",
      },
      {
        id: "BUT-RES1-L04",
        order: 4,
        title: "Gestion des processus, signaux et permissions sous Linux — freeCodeCamp (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=v_1y1PrXACU",
      },
    ],
  },
  {
    id: "BUT-WEB1",
    title: "Développement Web, Git & Génie Logiciel",
    category: "BUT",
    domain: "DEV",
    description: "HTML, CSS et JavaScript, HTTP et API REST, Git, tests et intégration continue.",
    prerequisites: [],
    markdownPath: "content/courses/BUT-WEB1.md",
    lessons: [
      {
        id: "BUT-WEB1-L01",
        order: 1,
        title: "Git & GitHub pour les développeurs (Branching, Merge, Rebase) — freeCodeCamp (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=RGOj5yH7evE",
      },
      {
        id: "BUT-WEB1-L02",
        order: 2,
        title: "Protocoles HTTP, Méthodes et Architectures API REST — Fireship (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=-MTSQjw5DrM",
      },
      {
        id: "BUT-WEB1-L03",
        order: 3,
        title: "JavaScript ES6+ et l'Asynchronisme (Promises, Async/Await) — Fireship (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=DHvZLI7aU3c",
      },
      {
        id: "BUT-WEB1-L04",
        order: 4,
        title: "Introduction aux Tests Unitaires et au TDD — Fireship (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=Jv2uxzhPFl4",
      },
    ],
  },
  {
    id: "BUT-MAT1",
    title: "Mathématiques du BUT (Logique, Ensembles, Matrices de base)",
    category: "BUT",
    domain: "MATHS",
    description:
        "Logique propositionnelle, ensembles, dénombrement, calcul matriciel de base et probabilités simples.",
    prerequisites: [],
    markdownPath: "content/courses/BUT-MAT1.md",
    lessons: [
      {
        id: "BUT-MAT1-L01",
        order: 1,
        title: "Logique propositionnelle, tables de vérité et démonstrations — TrevTutor (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=xlA2mS_1Moc",
      },
      {
        id: "BUT-MAT1-L02",
        order: 2,
        title: "Vecteurs — Essence of linear algebra, ch. 1 — 3Blue1Brown (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=fNk_zzaMoSs",
      },
      {
        id: "BUT-MAT1-L03",
        order: 3,
        title: "Transformations linéaires et matrices — ch. 3 — 3Blue1Brown (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=kYB8IZa5AuE",
      },
      {
        id: "BUT-MAT1-L04",
        order: 4,
        title: "Produit matriciel et composition — ch. 4 — 3Blue1Brown (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=XkY2DOUCWMU",
      },
    ],
  },

  // ─── SOCLE 2 : PASSERELLE INGÉNIEUR & IA ───
  {
    id: "ING-MAT2",
    title: "Algèbre Linéaire Avancée",
    category: "INGENIEUR_IA",
    domain: "MATHS",
    description: "Espaces vectoriels, applications linéaires, déterminants, valeurs et vecteurs propres, SVD.",
    prerequisites: ["BUT-MAT1"],
    markdownPath: "content/courses/ING-MAT2.md",
    lessons: [
      {
        id: "ING-MAT2-L01",
        order: 1,
        title: "Changements de base — Essence of linear algebra, ch. 13 — 3Blue1Brown (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=P2LTAUO1TdA",
      },
      {
        id: "ING-MAT2-L02",
        order: 2,
        title: "Le déterminant — ch. 6 — 3Blue1Brown (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=Ip3X9LOh2dk",
      },
      {
        id: "ING-MAT2-L03",
        order: 3,
        title: "Vecteurs propres et valeurs propres — ch. 14 — 3Blue1Brown (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=PFDu9oVAE-g",
      },
      {
        id: "ING-MAT2-L04",
        order: 4,
        title: "Décomposition en valeurs singulières (SVD) — Steve Brunton (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=gXbThCXjZFM",
      },
    ],
  },
  {
    id: "ING-MAT3",
    title: "Analyse Multivariée & Optimisation",
    category: "INGENIEUR_IA",
    domain: "MATHS",
    description:
        "Fonctions de plusieurs variables, dérivées partielles, gradient, hessienne, Taylor, descente de gradient.",
    prerequisites: ["ING-MAT2"],
    markdownPath: "content/courses/ING-MAT3.md",
    lessons: [
      {
        id: "ING-MAT3-L01",
        order: 1,
        title: "Dérivées partielles et gradients à plusieurs variables — 3Blue1Brown (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=GkB4vW16QHI",
      },
      {
        id: "ING-MAT3-L02",
        order: 2,
        title: "Matrice Hessienne et optimisation locale — Khan Academy (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=v3C3O3I_Y20",
      },
      {
        id: "ING-MAT3-L03",
        order: 3,
        title: "Optimisation sous contraintes : Multiplicateurs de Lagrange — Khan Academy (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=hQ4Sg2pP_xY",
      },
      {
        id: "ING-MAT3-L04",
        order: 4,
        title: "La Descente de Gradient pas à pas — StatQuest (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=sDv4f4s2SB8",
      },
    ],
  },
  {
    id: "ING-MAT4",
    title: "Probabilités Avancées & Statistiques Inférentielles",
    category: "INGENIEUR_IA",
    domain: "MATHS",
    description:
        "Variables aléatoires, lois usuelles, espérance et variance, Bayes, estimation, tests, chaînes de Markov.",
    prerequisites: ["BUT-MAT1"],
    markdownPath: "content/courses/ING-MAT4.md",
    lessons: [
      {
        id: "ING-MAT4-L01",
        order: 1,
        title: "Inférence Bayésienne & Théorème de Bayes — 3Blue1Brown (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=HZGCoVF3YvM",
      },
      {
        id: "ING-MAT4-L02",
        order: 2,
        title: "Loi Normale, Espérance et Variance — StatQuest (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=rzFX5NWojp0",
      },
      {
        id: "ING-MAT4-L03",
        order: 3,
        title: "Le Théorème Central Limite (TCL) visuellement expliqué — 3Blue1Brown (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=zeJD6dqJ5lo",
      },
      {
        id: "ING-MAT4-L04",
        order: 4,
        title: "Introduction aux Chaînes de Markov — Victor Lavrenko (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=i3AkTO9HLXo",
      },
    ],
  },
  {
    id: "ING-ALG2",
    title: "Mathématiques Discrètes & Théorie des Langages",
    category: "INGENIEUR_IA",
    domain: "MATHS",
    description: "Combinatoire, relations, graphes, automates finis, langages réguliers et grammaires.",
    prerequisites: ["BUT-ALG1", "BUT-MAT1"],
    markdownPath: "content/courses/ING-ALG2.md",
    lessons: [
      {
        id: "ING-ALG2-L01",
        order: 1,
        title: "Mathématiques Discrètes pour l'informatique — freeCodeCamp (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=tyDKR4FG3Yw",
      },
      {
        id: "ING-ALG2-L02",
        order: 2,
        title: "Automates finis déterministes (DFA) et non-déterministes (NFA) — Neso Academy (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=58N2N7zJGr8",
      },
      {
        id: "ING-ALG2-L03",
        order: 3,
        title: "Langages réguliers et Grammaires hors-contexte — Neso Academy (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=333MkW92u5g",
      },
      {
        id: "ING-ALG2-L04",
        order: 4,
        title: "Calculabilité, Machines de Turing et Décidabilité — Easy Theory (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=dA13e6T0yI8",
      },
    ],
  },
  {
    id: "ING-ALG3",
    title: "Algorithmique Avancée & Graphes",
    category: "INGENIEUR_IA",
    domain: "DEV",
    description:
        "Parcours, plus courts chemins (Dijkstra, A*), arbres couvrants, flots, programmation dynamique, NP-complétude.",
    prerequisites: ["ING-ALG2"],
    markdownPath: "content/courses/ING-ALG3.md",
    lessons: [
      {
        id: "ING-ALG3-L01",
        order: 1,
        title: "Algorithmes de recherche dans les graphes (Dijkstra, A*, BFS/DFS) — freeCodeCamp (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=tWVWeAqZ0WU",
      },
      {
        id: "ING-ALG3-L02",
        order: 2,
        title: "Arbres couvrants minimaux (Kruskal, Prim) et Flot Max (Ford-Fulkerson) — WilliamFiset (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=09_LlHjoEiY",
      },
      {
        id: "ING-ALG3-L03",
        order: 3,
        title: "Programmation Dynamique : Résolution de problèmes complexes — freeCodeCamp (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=oBt53YbR9Kk",
      },
      {
        id: "ING-ALG3-L04",
        order: 4,
        title: "Théorie de la complexité : P, NP, NP-Complet et NP-Difficile — Abdul Bari (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=e2UFFxBrb2Y",
      },
    ],
  },
  {
    id: "ING-IA1",
    title: "Fondations du Machine Learning",
    category: "INGENIEUR_IA",
    domain: "IA",
    description:
        "Régressions, classification (KNN, SVM, arbres, forêts), clustering, PCA, validation croisée, biais/variance.",
    prerequisites: ["ING-MAT2", "ING-MAT3", "ING-MAT4", "BUT-DEV1"],
    markdownPath: "content/courses/ING-IA1.md",
    lessons: [
      {
        id: "ING-IA1-L01",
        order: 1,
        title: "Introduction globale au Machine Learning et aux algorithmes — StatQuest (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=Gv9_4yMHFhI",
      },
      {
        id: "ING-IA1-L02",
        order: 2,
        title: "Machine Learning pratique en Python (Scikit-Learn, Pandas, Numpy) — Machine Learnia (FR)",
        youtubeUrl: "https://www.youtube.com/watch?v=823qnyhMKhA",
      },
      {
        id: "ING-IA1-L03",
        order: 3,
        title: "Les algorithmes de classification (SVM, Random Forests, Decision Trees) — StatQuest (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=efR1C6UrvzU",
      },
      {
        id: "ING-IA1-L04",
        order: 4,
        title: "Réduction de dimensionnalité : ACP / PCA expliquée visuellement — StatQuest (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=FgakZw6K1QQ",
      },
      {
        id: "ING-IA1-L05",
        order: 5,
        title: "Évaluation des modèles : Courbe ROC, AUC, F1-Score et Cross-Validation — StatQuest (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=4jRBRDbJemM",
      },
    ],
  },
  {
    id: "ING-IA2",
    title: "Deep Learning & Réseaux de Neurones",
    category: "INGENIEUR_IA",
    domain: "IA",
    description:
        "Perceptron multicouche, rétropropagation, activations et fonctions de perte, CNN, RNN, Transformers.",
    prerequisites: ["ING-IA1"],
    markdownPath: "content/courses/ING-IA2.md",
    lessons: [
      {
        id: "ING-IA2-L01",
        order: 1,
        title: "Qu'est-ce qu'un réseau de neurones ? — Deep Learning, ch. 1 — 3Blue1Brown (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=aircAruvnKk",
      },
      {
        id: "ING-IA2-L02",
        order: 2,
        title: "L'algorithme de Rétropropagation (Backpropagation) — ch. 3 — 3Blue1Brown (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=Ilg3gGewQ5U",
      },
      {
        id: "ING-IA2-L03",
        order: 3,
        title: "Réseaux de neurones convolutifs (CNN) pour la Computer Vision — StatQuest (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=HGwBXDKFk9I",
      },
      {
        id: "ING-IA2-L04",
        order: 4,
        title: "Construire un Transformer (GPT) à partir de zéro — Andrej Karpathy (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=kCc8FmEb1nY",
      },
      {
        id: "ING-IA2-L05",
        order: 5,
        title: "Masterclass Deep Learning avec PyTorch — freeCodeCamp (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=V_xro1bcAuA",
      },
    ],
  },
  {
    id: "ING-ARCH1",
    title: "Architecture Logicielle & Systèmes Distribués",
    category: "INGENIEUR_IA",
    domain: "ARCHI",
    description:
        "Architectures en couches et hexagonale, microservices, messagerie, cohérence, théorème CAP, conteneurs.",
    prerequisites: ["BUT-DEV1", "BUT-RES1"],
    markdownPath: "content/courses/ING-ARCH1.md",
    lessons: [
      {
        id: "ING-ARCH1-L01",
        order: 1,
        title: "System Design & Architecture des systèmes distribués — ByteByteGo (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=m8Icp_Cid5o",
      },
      {
        id: "ING-ARCH1-L02",
        order: 2,
        title: "Patterns d'architecture logicielle (Hexagonale, Event-Driven, Microservices) — Fireship (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=CmW5409pAAM",
      },
      {
        id: "ING-ARCH1-L03",
        order: 3,
        title: "Le Théorème CAP et la gestion de la cohérence distribuée — ByteByteGo (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=BHqjEjzAicA",
      },
      {
        id: "ING-ARCH1-L04",
        order: 4,
        title: "Conteneurisation avancée et Orchestration avec Docker & Kubernetes — Xavki (FR)",
        youtubeUrl: "https://www.youtube.com/watch?v=c2mKThR5450",
      },
    ],
  },
  {
    id: "ING-ENG1",
    title: "Anglais Technique & Préparation TOEIC 900+",
    category: "INGENIEUR_IA",
    domain: "ANGLAIS",
    description:
        "Lecture de documentation et d'articles, vocabulaire technique, compréhension orale, stratégies TOEIC.",
    prerequisites: [],
    markdownPath: "content/courses/ING-ENG1.md",
    lessons: [
      {
        id: "ING-ENG1-L01",
        order: 1,
        title: "Vocabulaire anglais technique et Software Engineering — English for Tech (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=342IeA8y_c8",
      },
      {
        id: "ING-ENG1-L02",
        order: 2,
        title: "Entraînement complet TOEIC Listening & Reading — TOEIC Test Prep (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=Kz6E11a14cE",
      },
      {
        id: "ING-ENG1-L03",
        order: 3,
        title: "Grammaire et structures complexes indispensables pour le TOEIC 900+ — Learn English (EN)",
        youtubeUrl: "https://www.youtube.com/watch?v=s1R1x_hC9g0",
      },
    ],
  },
];