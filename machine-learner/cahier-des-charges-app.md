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