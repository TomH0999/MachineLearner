# Algorithmique avancée et graphes : parcours, plus courts chemins, flots et complexité

Les graphes modélisent des réseaux routiers, des dépendances entre tâches ou des flux de données, et quelques algorithmes classiques répondent à la plupart des questions qu'on leur pose. Cette fiche les présente avec leurs conditions d'emploi et leur coût, puis aborde la programmation dynamique et les limites de l'algorithmique efficace, avec les classes P et NP.

## Représenter et parcourir un graphe

Un graphe à $V$ sommets et $E$ arêtes se stocke soit en **matrice d'adjacence** ($V^2$ cases, test d'une arête en $O(1)$), soit en **listes d'adjacence** (taille $O(V + E)$, idéales pour les graphes creux). Les deux parcours de base marquent chaque sommet une fois et examinent chaque arête une fois (deux fois en non orienté), soit $O(V + E)$ avec des listes :

- le **parcours en largeur** (BFS) utilise une **file** : il visite la source, puis tous ses voisins, puis les voisins de ceux-ci, couche par couche. Dans un graphe non pondéré, il donne les plus courts chemins en nombre d'arêtes ;
- le **parcours en profondeur** (DFS) utilise une **pile**, ou la récursion : il s'enfonce le plus loin possible avant de revenir en arrière. Il sert à trouver les composantes connexes, à détecter un cycle (un arc vers un sommet encore en cours d'exploration) et à trier topologiquement un graphe orienté.

## Plus courts chemins : relaxation et Dijkstra

On note $w(u, v)$ le poids de l'arc $(u, v)$ et $d[v]$ la meilleure distance connue depuis la source $s$, initialisée à $d[s] = 0$ et $d[v] = +\infty$ pour les autres sommets. Tous les algorithmes de plus courts chemins reposent sur la **relaxation** d'un arc ; quand elle améliore $d[v]$, on mémorise $u$ comme **prédécesseur** de $v$, ce qui permet de reconstruire le chemin en remontant depuis la cible. Les algorithmes ne diffèrent que par l'**ordre** dans lequel ils relâchent les arcs.

$$
d[v] \leftarrow \min\big(d[v],\ d[u] + w(u, v)\big)
$$

Avec des poids **positifs ou nuls**, **Dijkstra** extrait à chaque étape, d'une **file de priorité**, le sommet de plus petite distance provisoire : comme aucun détour ne peut raccourcir un chemin, cette distance est définitive. Il relâche ensuite les arcs qui sortent de ce sommet, pour un coût total de $O((V + E) \log V)$ avec un tas binaire. Exemple avec les arcs $A \to B$ (4), $A \to C$ (1), $C \to B$ (2), $B \to D$ (1) et $C \to D$ (5), depuis la source $A$ :

| Étape | Sommet extrait | $d[A]$ | $d[B]$ | $d[C]$ | $d[D]$ | Relaxations |
|---|---|---|---|---|---|---|
| 0 | aucun | 0 | ∞ | ∞ | ∞ | initialisation |
| 1 | A (0) | 0 | 4 | 1 | ∞ | B : 4 ; C : 1 |
| 2 | C (1) | 0 | **3** | 1 | 6 | B : min(4, 1 + 2) = 3 ; D : 1 + 5 = 6 |
| 3 | B (3) | 0 | 3 | 1 | **4** | D : min(6, 3 + 1) = 4 |
| 4 | D (4) | 0 | 3 | 1 | 4 | aucun arc sortant |

Distances finales : $A = 0$, $C = 1$, $B = 3$ et $D = 4$. Le prédécesseur de $D$ est $B$, celui de $B$ est $C$ et celui de $C$ est $A$ : le plus court chemin vers $D$ est donc $A \to C \to B \to D$, de coût $1 + 2 + 1 = 4$, alors que l'arc direct $C \to D$ donnait 6.

## Bellman-Ford et A\*

Si certains poids sont **négatifs**, Dijkstra peut se tromper : un sommet déjà extrait pourrait encore être amélioré par un arc négatif examiné plus tard. **Bellman-Ford** relâche alors **tous** les arcs, $V - 1$ fois, en $O(V \times E)$. Un plus court chemin sans cycle a au plus $V - 1$ arcs, donc c'est suffisant ; si une $V$-ième passe améliore encore une distance, il existe un **cycle de poids négatif** accessible, et les plus courts chemins ne sont pas définis.

**A\*** cherche le plus court chemin vers une **cible** précise. Il extrait le sommet $n$ qui minimise $f(n) = g(n) + h(n)$, où $g(n)$ est la distance déjà parcourue depuis la source et $h(n)$ une **heuristique** qui estime la distance restante. Si $h$ est **admissible**, c'est-à-dire si elle ne surestime jamais la vraie distance, le chemin renvoyé est optimal ; si elle est de plus **cohérente**, $h(u) \leq w(u, v) + h(v)$, aucun sommet n'a besoin d'être traité deux fois. Sur une grille à 4 directions, la distance de Manhattan $|\Delta x| + |\Delta y|$ remplit ces deux conditions ; avec $h = 0$, A\* redevient Dijkstra.

## Tri topologique

Un **DAG** (graphe orienté acyclique) représente des dépendances : un arc $u \to v$ signifie « $u$ doit précéder $v$ ». Un **tri topologique** range les sommets de sorte que chaque arc aille de gauche à droite ; il existe si et seulement si le graphe n'a pas de cycle. L'**algorithme de Kahn** le construit en $O(V + E)$ : il place dans une file les sommets de **degré entrant** nul, puis retire un à un les sommets de la file, les ajoute au résultat et décrémente le degré entrant de leurs successeurs, qui entrent à leur tour dans la file quand ce degré atteint 0. Si le résultat contient moins de $V$ sommets, ceux qui manquent appartiennent à un cycle ou en dépendent : aucun ordre n'existe. On peut aussi trier par DFS, en listant les sommets dans l'ordre inverse de leur fin d'exploration.

## Exemple concret : EngiPath

L'arbre de compétences d'EngiPath est un DAG : chaque module est un sommet, et chaque prérequis un arc du module requis vers le module qui l'exige. Par exemple, ING-ALG2 exige BUT-ALG1 et BUT-MAT1, et ING-ALG3 exige à son tour ING-ALG2. Un module se débloque quand **tous** ses prérequis sont validés, ce qui reproduit exactement la logique de Kahn : son degré entrant compte les prérequis non encore validés, et il devient accessible quand ce compteur tombe à 0. L'application ordonne donc les modules par tri topologique, avec l'algorithme de Kahn : les modules sans prérequis viennent en premier, et chaque module apparaît après tous ceux qu'il exige. Un cycle de prérequis (A exige B, qui exige A) rendrait ses modules impossibles à débloquer ; Kahn le repère, car les modules du cycle n'atteignent jamais un degré entrant nul et restent hors du résultat.

## Arbres couvrants minimaux

Dans un graphe non orienté, connexe et pondéré, un **arbre couvrant minimal** (ACM) relie tous les sommets avec $V - 1$ arêtes de poids total minimal : câblage d'un réseau, tracé de routes. Deux algorithmes **gloutons** le trouvent, en s'appuyant sur la même propriété : pour toute coupe du graphe, l'arête la plus légère qui la traverse appartient à un ACM. **Kruskal** trie les arêtes par poids croissant et ajoute chacune si elle relie deux composantes différentes ; sinon, elle fermerait un cycle et il la rejette. Une structure **union-find** teste et fusionne les composantes, pour un coût total de $O(E \log E)$, dominé par le tri. **Prim** part d'un sommet et fait grandir un seul arbre, en ajoutant à chaque étape l'arête la plus légère qui le relie à un sommet extérieur. Avec un tas, il coûte $O((V + E) \log V)$.

## Flots dans un réseau

Un **réseau de flot** est un graphe orienté dont chaque arc $(u, v)$ a une **capacité** $c(u, v) \geq 0$, avec une source $s$ et un puits $t$. Un flot respecte les capacités et se conserve en chaque sommet intermédiaire : tout ce qui entre ressort. **Ford-Fulkerson** part du flot nul et, tant qu'il existe un **chemin augmentant** de $s$ à $t$ dans le **graphe résiduel** (capacités restantes, plus des arcs inverses qui permettent d'annuler du flot), y pousse autant de flot que le permet son arc le plus faible. Choisir à chaque fois le chemin augmentant le plus court, trouvé par BFS, donne l'algorithme d'**Edmonds-Karp**, en $O(V \times E^2)$.

Une **coupe** $(S, T)$ sépare $s \in S$ de $t \in T$, et sa capacité $c(S, T)$ est la somme des capacités des arcs qui vont de $S$ vers $T$. Tout flot doit traverser chaque coupe, et le théorème **flot max / coupe min** affirme que cette borne est atteinte ; quand Ford-Fulkerson s'arrête, les sommets encore accessibles depuis $s$ dans le graphe résiduel forment le côté $S$ d'une coupe minimale.

$$
\text{flot max} = \max_{f} \, |f| = \min_{(S, T)} \, c(S, T) = \text{coupe min}
$$

## Programmation dynamique

La **programmation dynamique** s'applique quand un problème a une **sous-structure optimale** (une solution optimale se construit à partir de solutions optimales de sous-problèmes) et des **sous-problèmes qui se chevauchent** (la récursion naïve les recalcule de nombreuses fois). On résout chaque sous-problème une seule fois, soit de haut en bas avec un cache (**mémoïsation**), soit de bas en haut en remplissant une table.

**Sac à dos 0/1.** On dispose de $n$ objets de poids $w_i$ et de valeur $v_i$, et d'un sac de capacité $W$ ; chaque objet est pris ou non, et l'on maximise la valeur totale. Soit $K[i][c]$ la meilleure valeur avec les $i$ premiers objets et une capacité $c$ ; on pose $K[0][c] = 0$, puis on applique la récurrence ci-dessous. La table l'illustre pour une capacité de 5 et quatre objets (poids, valeur) : 1 = (2, 3), 2 = (3, 4), 3 = (4, 5) et 4 = (5, 6), chaque ligne ajoutant un objet.

$$
K[i][c] = \begin{cases} K[i-1][c] & \text{si } w_i > c \\ \max\big(K[i-1][c],\ K[i-1][c - w_i] + v_i\big) & \text{sinon} \end{cases}
$$

| Objets disponibles | c = 0 | c = 1 | c = 2 | c = 3 | c = 4 | c = 5 |
|---|---|---|---|---|---|---|
| 1 | 0 | 0 | 3 | 3 | 3 | 3 |
| 1 et 2 | 0 | 0 | 3 | 4 | 4 | **7** |
| 1 à 3 | 0 | 0 | 3 | 4 | 5 | 7 |
| 1 à 4 | 0 | 0 | 3 | 4 | 5 | **7** |

L'optimum vaut 7 : les objets 1 et 2, de poids total $2 + 3 = 5$. L'objet 4 seul ne rapporte que 6, et les objets 1 et 3 dépassent la capacité. La table coûte $O(n \times W)$ : cette complexité est **pseudo-polynomiale**, car $W$ peut être exponentiel en la taille de son écriture.

## En pratique avec Python

Le code suivant applique Dijkstra à l'exemple avec le module `heapq`, qui ne sait pas diminuer une clé : on empile une nouvelle entrée à chaque amélioration et l'on ignore les entrées périmées. Il reconstruit ensuite le chemin, puis remplit la table du sac à dos.

```python
import heapq

# 1. Dijkstra avec un tas binaire, puis reconstruction du chemin
graphe = {"A": [("B", 4), ("C", 1)], "B": [("D", 1)],
          "C": [("B", 2), ("D", 5)], "D": []}

def dijkstra(graphe, source):
    dist = {s: float("inf") for s in graphe}
    pred = {s: None for s in graphe}
    dist[source] = 0
    tas, ordre = [(0, source)], []
    while tas:
        d, u = heapq.heappop(tas)
        if d > dist[u]:              # entrée périmée : u a déjà été extrait
            continue
        ordre.append(u)
        for v, w in graphe[u]:
            if dist[u] + w < dist[v]:            # relaxation de l'arc (u, v)
                dist[v], pred[v] = dist[u] + w, u
                heapq.heappush(tas, (dist[v], v))
    return dist, pred, ordre

dist, pred, ordre = dijkstra(graphe, "A")
print(ordre, dist)       # ['A', 'C', 'B', 'D'] {'A': 0, 'B': 3, 'C': 1, 'D': 4}
etapes, s = [], "D"
while s is not None:                             # on remonte les prédécesseurs
    etapes.append(s)
    s = pred[s]
print(" -> ".join(reversed(etapes)))             # A -> C -> B -> D

# 2. Sac à dos 0/1 en programmation dynamique (table remplie de bas en haut)
objets = [(2, 3), (3, 4), (4, 5), (5, 6)]       # (poids, valeur)
capacite, n = 5, len(objets)
K = [[0] * (capacite + 1) for _ in range(n + 1)]
for i in range(1, n + 1):
    w, v = objets[i - 1]
    for c in range(capacite + 1):
        K[i][c] = K[i - 1][c]                    # sans l'objet i
        if w <= c:                               # avec l'objet i, s'il tient
            K[i][c] = max(K[i][c], K[i - 1][c - w] + v)
choisis, c = [], capacite
for i in range(n, 0, -1):                        # on remonte la table
    if K[i][c] != K[i - 1][c]:                   # la valeur a changé : objet i pris
        choisis.append(i)
        c -= objets[i - 1][0]
print(K[n], K[n][capacite], sorted(choisis))     # [0, 0, 3, 4, 5, 7] 7 [1, 2]
```

## Classes P, NP et NP-complétude

On classe les **problèmes de décision**, dont la réponse est oui ou non, selon le temps nécessaire en fonction de la taille de l'entrée. **P** regroupe les problèmes résolus en temps polynomial, comme l'existence d'un chemin entre deux sommets. **NP** regroupe ceux dont une solution proposée, le **certificat**, se **vérifie** en temps polynomial : pour SAT, vérifier une affectation des variables est facile, la trouver semble difficile. On a $P \subseteq NP$, et la question $P = NP$ reste ouverte.

Une **réduction polynomiale** de $A$ vers $B$ transforme en temps polynomial toute instance de $A$ en une instance de $B$ de même réponse : $B$ est alors au moins aussi difficile que $A$. Un problème est **NP-difficile** si tout problème de NP s'y réduit, et **NP-complet** s'il appartient de plus à NP : SAT (théorème de Cook-Levin), 3-SAT, la 3-coloration d'un graphe, ou les versions de décision du voyageur de commerce et du sac à dos. Pour montrer qu'un nouveau problème $X$ est NP-complet, on vérifie qu'il est dans NP, puis on réduit un problème NP-complet connu **vers** $X$. Enfin, NP signifie « polynomial non déterministe », et non « non polynomial ».

## Panorama des algorithmes

| Algorithme | Problème | Contraintes | Complexité |
|---|---|---|---|
| BFS | parcours, plus courts chemins sans poids | aucune | $O(V + E)$ |
| DFS | parcours, cycles, composantes | aucune | $O(V + E)$ |
| Dijkstra | plus courts chemins depuis une source | poids positifs ou nuls | $O((V + E) \log V)$ avec un tas |
| Bellman-Ford | plus courts chemins depuis une source | poids quelconques ; détecte les cycles négatifs | $O(V \times E)$ |
| A\* | plus court chemin vers une cible | poids positifs ou nuls, heuristique admissible | selon $h$ ; celle de Dijkstra si $h = 0$ |
| Kahn | tri topologique | graphe orienté sans cycle, sinon cycle détecté | $O(V + E)$ |
| Kruskal | arbre couvrant minimal | graphe non orienté pondéré | $O(E \log E)$ |
| Prim | arbre couvrant minimal | graphe non orienté, connexe, pondéré | $O((V + E) \log V)$ avec un tas |
| Edmonds-Karp | flot maximal | capacités positives ou nulles | $O(V \times E^2)$ |
| Sac à dos 0/1 | valeur maximale sous une capacité | poids entiers | $O(n \times W)$ |

## À retenir

> - BFS (file) et DFS (pile) coûtent $O(V + E)$ ; le BFS donne les plus courts chemins sans poids, le DFS détecte les cycles.
> - Relaxation : $d[v] \leftarrow \min(d[v], d[u] + w(u, v))$ ; Dijkstra exige des poids $\geq 0$, Bellman-Ford accepte les poids négatifs et détecte les cycles négatifs ; A\* est optimal si son heuristique ne surestime jamais.
> - Un graphe orienté admet un tri topologique si et seulement s'il est acyclique ; Kahn le construit en $O(V + E)$, comme pour l'arbre d'EngiPath.
> - Kruskal et Prim, deux algorithmes gloutons, donnent un arbre couvrant minimal ; dans un réseau, flot max = coupe min.
> - Programmation dynamique : sous-structure optimale et sous-problèmes qui se chevauchent, chacun résolu une seule fois.
> - NP : solution vérifiable en temps polynomial ; pour prouver qu'un problème est NP-complet, on montre qu'il est dans NP, puis on y réduit un problème NP-complet connu.
