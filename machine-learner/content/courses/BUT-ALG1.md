# Algorithmique et structures de données : complexité, tris, listes, arbres et hachage

Un algorithme se juge d'abord à son coût, c'est-à-dire à la manière dont son temps d'exécution grandit avec la taille n des données, et la notation O permet de comparer ces coûts sans dépendre de la machine. Cette fiche présente la recherche dichotomique, les tris usuels et les structures de données de base (tableau, liste chaînée, pile, file, arbre binaire de recherche, table de hachage), avec la complexité de chacune de leurs opérations.

## Complexité et notation O

On compte les opérations élémentaires (comparaisons, affectations, accès mémoire) en fonction de n, en général dans le **pire cas**, qui donne une garantie valable pour toutes les entrées. La notation O ne garde que l'ordre de grandeur : une fonction f est en O(g) si, à partir d'un certain rang, elle reste sous un multiple constant de g.

$$
f(n) = O(g(n)) \iff \exists\, c > 0,\ \exists\, n_0,\ \forall n \geq n_0,\ f(n) \leq c \cdot g(n)
$$

Ainsi $3n^2 + 5n + 2 = O(n^2)$ : pour $n \geq 1$, on a $3n^2 + 5n + 2 \leq 3n^2 + 5n^2 + 2n^2 = 10\,n^2$, donc $c = 10$ et $n_0 = 1$ conviennent ; les constantes et les termes d'ordre inférieur disparaissent. Les classes usuelles, de la plus rapide à la plus lente : $O(1)$ (accès à une case de tableau), $O(\log n)$ (recherche dichotomique), $O(n)$ (parcours d'une liste), $O(n \log n)$ (tri fusion), $O(n^2)$ (deux boucles imbriquées, tri par insertion dans le pire cas) et $O(2^n)$ (essai de tous les sous-ensembles). Pour n = 1 000 000, un algorithme en $O(n \log n)$ effectue de l'ordre de $2 \times 10^7$ opérations, contre $5 \times 10^{11}$ pour $n^2/2$ : c'est la différence entre une fraction de seconde et plusieurs minutes.

## Recherche séquentielle et recherche dichotomique

La recherche **séquentielle** examine les éléments un par un : $O(n)$ dans le pire cas, mais elle fonctionne sur n'importe quel tableau. La recherche **dichotomique** exige un tableau **trié** : on compare la valeur cherchée à l'élément du milieu, puis on ne garde que la moitié qui peut la contenir. Chaque comparaison ratée réduit une zone de s éléments à au plus ⌊s/2⌋ éléments ; avec k comparaisons, on traite donc une zone d'au plus $2^k - 1$ éléments. Le nombre maximal de comparaisons vaut :

$$
C_{\max}(n) = \left\lceil \log_2(n + 1) \right\rceil
$$

Pour n = 1 000, il faut au plus 10 comparaisons ; pour un million d'éléments, 20 suffisent. La complexité est $O(\log n)$, à condition que l'accès au milieu se fasse en $O(1)$ : sur une liste chaînée, atteindre le milieu coûte déjà $O(n)$.

## Tris : insertion, fusion et tri rapide

Le **tri par insertion** insère chaque élément à sa place dans la partie déjà triée : $O(n^2)$ dans le pire cas (tableau trié à l'envers), mais $O(n)$ sur un tableau déjà trié. Le **tri à bulles**, qui échange les voisins mal ordonnés, est lui aussi en $O(n^2)$ ; ces tris simples conviennent aux petits tableaux. Le **tri fusion** applique le principe « diviser pour régner » : couper le tableau en deux, trier chaque moitié récursivement, puis **fusionner** les deux moitiés triées en un seul parcours, en $O(n)$. Son coût vérifie la récurrence :

$$
T(n) = 2\,T\!\left(\frac{n}{2}\right) + O(n) \quad \Longrightarrow \quad T(n) = O(n \log n)
$$

L'arbre des appels compte environ $\log_2 n$ niveaux, et chaque niveau fusionne les n éléments au total : $O(n \log n)$ dans **tous** les cas, au prix d'un tableau auxiliaire de taille n. Le tri fusion est **stable** : deux éléments égaux gardent leur ordre d'origine. Le **tri rapide** (quicksort) choisit un **pivot**, place les éléments plus petits à sa gauche et les plus grands à sa droite, puis trie les deux parties. Il est en $O(n \log n)$ en moyenne et trie sur place, mais si le pivot est à chaque fois le plus petit ou le plus grand élément (premier élément pris comme pivot sur un tableau déjà trié), les partitions ont pour tailles $n - 1$ et $0$ : $T(n) = T(n - 1) + O(n)$, soit $O(n^2)$. Un pivot aléatoire ou la médiane de trois éléments rendent ce cas très improbable. La fonction `sorted()` de Python utilise un tri fusion adaptatif, stable et en $O(n \log n)$.

## Structures linéaires : tableau, liste chaînée, pile et file

Un **tableau** range ses éléments dans des cases mémoire contiguës : l'adresse de `t[i]` se calcule directement (adresse de départ + i × taille d'une case), d'où un accès en $O(1)$. En contrepartie, insérer au début oblige à décaler tous les éléments : $O(n)$. Une **liste chaînée** relie des **maillons** contenant chacun une valeur et un pointeur vers le suivant. Insérer en tête ne modifie que deux pointeurs, en $O(1)$, mais atteindre le i-ème élément impose de suivre les maillons depuis la tête : $O(n)$.

```c
#include <stdlib.h>
typedef struct Maillon { int valeur; struct Maillon *suivant; } Maillon;
/* Insertion en tête en O(1), quelle que soit la longueur. Utilisation : tete = inserer_tete(tete, 42); */
Maillon *inserer_tete(Maillon *tete, int valeur) {
    Maillon *m = malloc(sizeof *m);
    if (m == NULL) return tete;   /* allocation refusée : liste inchangée */
    m->valeur = valeur;
    m->suivant = tete;            /* le nouveau maillon pointe vers l'ancienne tête */
    return m;                     /* et devient la nouvelle tête */
}
```

Une **pile** est **LIFO** (dernier entré, premier sorti) : on empile et on dépile au **sommet**, en $O(1)$. Elle sert à annuler des actions, à vérifier le parenthésage d'une expression, et c'est elle qui gère les appels de fonctions. Une **file** est **FIFO** (premier entré, premier sorti) : on ajoute en **queue** et on retire en **tête**, en $O(1)$, comme pour la file d'attente d'une imprimante. En Python, une `list` fait une bonne pile (`append` et `pop`), mais pas une bonne file : `pop(0)` décale tous les éléments, en $O(n)$. On utilise donc `collections.deque` et sa méthode `popleft`.

## Arbres binaires de recherche

Un **arbre binaire de recherche** (ABR) respecte une propriété en chaque nœud : les clés de son sous-arbre gauche sont inférieures à sa clé, et celles de son sous-arbre droit supérieures. Rechercher une clé consiste à descendre à gauche ou à droite selon la comparaison, ce qui coûte $O(h)$, où h est la hauteur de l'arbre (ici, le nombre de nœuds du plus long chemin depuis la racine). Pour supprimer un nœud à deux enfants, on le remplace par son successeur, la plus petite clé de son sous-arbre droit. Si l'arbre est **équilibré**, $h \approx \log_2 n$ : recherche, insertion et suppression coûtent $O(\log n)$, ce que les arbres AVL et rouge-noir garantissent en se rééquilibrant après chaque modification. Si l'on insère les clés dans l'ordre croissant sans rééquilibrage, chaque clé va à droite de la précédente : l'arbre **dégénère** en liste, $h = n$, et toutes les opérations passent en $O(n)$.

| Parcours | Ordre de visite | Arbre obtenu en insérant 50, 30, 70, 20, 40, 60, 80 |
|---|---|---|
| infixe | gauche, racine, droite | 20, 30, 40, 50, 60, 70, 80 : les clés dans l'ordre **croissant** |
| préfixe | racine, gauche, droite | 50, 30, 20, 40, 70, 60, 80 : l'ordre qui permet de recopier l'arbre |
| postfixe | gauche, droite, racine | 20, 40, 30, 60, 80, 70, 50 : chaque nœud après ses enfants |
| en largeur | niveau par niveau, avec une file | 50, 30, 70, 20, 40, 60, 80 |

## Tables de hachage

Une **table de hachage** range chaque clé dans une **alvéole** dont l'indice est calculé par une **fonction de hachage** : h(clé) donne un entier entre 0 et m − 1, où m est le nombre d'alvéoles. Recherche, insertion et suppression coûtent $O(1)$ en moyenne, sans aucun ordre entre les clés ; les `dict` et `set` de Python sont des tables de hachage. La fonction de hachage n'est pas injective : deux clés différentes peuvent recevoir le même indice, c'est une **collision**. On la gère par **chaînage** (chaque alvéole contient une liste de paires clé-valeur) ou par **adressage ouvert** (on cherche une autre alvéole libre, par exemple la suivante). Le **facteur de charge** $\alpha = n/m$ mesure le remplissage : quand il dépasse un seuil, on double le nombre d'alvéoles et on replace toutes les clés, ce qui garde un coût moyen en $O(1)$. Si toutes les clés tombent dans la même alvéole, la table se comporte comme une liste et chaque opération coûte $O(n)$ : une bonne fonction de hachage répartit les clés uniformément.

## Récursivité

Une fonction **récursive** s'appelle elle-même sur un problème plus petit. Elle doit avoir un **cas de base**, qui renvoie un résultat sans nouvel appel (par exemple `fact(0) = 1`), et chaque appel doit s'en rapprocher, sinon la récursion ne termine pas. Chaque appel en cours occupe un **cadre** sur la **pile d'appels** (paramètres, variables locales, adresse de retour), libéré quand l'appel se termine : `fact(n)` empile n cadres, alors que le tri fusion ne descend qu'à une profondeur d'environ $\log_2 n$. Sans cas de base, ou avec une récursion trop profonde, la pile **déborde** (stack overflow) : Python interrompt le programme par une `RecursionError` au-delà d'une profondeur limite, 1 000 par défaut (`sys.getrecursionlimit()`). On réécrit alors l'algorithme avec une boucle et, si besoin, une pile explicite.

## Tableau des complexités

Complexités dans le pire cas, sauf mention contraire. L'accès désigne la lecture de l'élément de rang i ; « — » indique une structure qui n'offre pas cette opération.

| Structure | Accès | Recherche | Insertion | Suppression |
|---|---|---|---|---|
| Tableau | O(1) | O(n), O(log n) si trié | O(n), O(1) amorti en fin | O(n), O(1) en fin |
| Liste chaînée | O(n) | O(n) | O(1) en tête | O(1) en tête, O(n) ailleurs |
| Pile / file | O(1) au sommet ou en tête | O(n) | O(1) | O(1) |
| ABR équilibré (AVL, rouge-noir) | — | O(log n) | O(log n) | O(log n) |
| ABR dégénéré | — | O(n) | O(n) | O(n) |
| Table de hachage (moyenne) | — | O(1) | O(1) | O(1) |
| Table de hachage (pire cas) | — | O(n) | O(n) | O(n) |

## En pratique avec Python

```python
from collections import deque
# 1. Recherche dichotomique : on compte les tours de boucle
def dichotomie(t, x):
    debut, fin, tours = 0, len(t) - 1, 0
    while debut <= fin:
        tours += 1
        milieu = (debut + fin) // 2
        if t[milieu] == x:
            return milieu, tours        # (indice, nombre de tours)
        if t[milieu] < x:
            debut = milieu + 1          # on garde la moitié droite
        else:
            fin = milieu - 1            # on garde la moitié gauche
    return -1, tours
t = list(range(1, 1001))
print(dichotomie(t, 777), dichotomie(t, 1), dichotomie(t, 1001))
# (776, 8) (0, 9) (-1, 10)       1001 est absent : 10 tours, le maximum

# 2. Tri fusion : couper en deux, trier chaque moitié, fusionner
def tri_fusion(t):
    if len(t) <= 1:                     # cas de base
        return t
    g, d = tri_fusion(t[:len(t) // 2]), tri_fusion(t[len(t) // 2:])
    res, i, j = [], 0, 0
    while i < len(g) and j < len(d):
        if g[i] <= d[j]:
            res.append(g[i]); i += 1
        else:
            res.append(d[j]); j += 1
    return res + g[i:] + d[j:]
print(tri_fusion([38, 27, 43, 3, 9, 82, 10]))   # [3, 9, 10, 27, 38, 43, 82]

# 3. Pile (list) et file (deque) : toutes les opérations en O(1)
pile = [1, 2, 3]                        # empilés dans cet ordre, 3 au sommet
print(pile.pop(), pile.pop(), pile)     # 3 2 [1]
file = deque(["doc1", "doc2", "doc3"])  # doc1 est arrivé en premier
print(file.popleft(), list(file))       # doc1 ['doc2', 'doc3']

# 4. Arbre binaire de recherche : insertion, parcours infixe, hauteur
class Noeud:
    def __init__(self, cle):
        self.cle, self.gauche, self.droite = cle, None, None
def inserer(n, cle):
    if n is None:
        return Noeud(cle)
    if cle < n.cle:
        n.gauche = inserer(n.gauche, cle)
    else:
        n.droite = inserer(n.droite, cle)
    return n
def infixe(n):                          # gauche, racine, droite
    return infixe(n.gauche) + [n.cle] + infixe(n.droite) if n else []
def hauteur(n):
    return 1 + max(hauteur(n.gauche), hauteur(n.droite)) if n else 0

equilibre, degenere = None, None
for cle in [50, 30, 70, 20, 40, 60, 80]:
    equilibre = inserer(equilibre, cle)
for cle in [20, 30, 40, 50, 60, 70, 80]:  # ordre croissant : l'arbre dégénère
    degenere = inserer(degenere, cle)
print(infixe(equilibre), hauteur(equilibre), hauteur(degenere))
# [20, 30, 40, 50, 60, 70, 80] 3 7

# 5. Table de hachage à chaînage, 6 alvéoles (hachage maison : hash() varie d'une exécution à l'autre)
alveoles = [[] for _ in range(6)]
def indice(cle):                        # somme des codes des caractères, modulo 6
    return sum(ord(c) for c in cle) % len(alveoles)
def ajouter(cle, valeur):
    alveole = alveoles[indice(cle)]
    for paire in alveole:
        if paire[0] == cle:             # clé déjà présente : mise à jour
            paire[1] = valeur
            return
    alveole.append([cle, valeur])       # sinon, ajout au bout de la chaîne
for fruit, prix in [("pomme", 2), ("kiwi", 3), ("poire", 4), ("prune", 5)]:
    ajouter(fruit, prix)
print(indice("pomme"), indice("prune"))  # 2 2 : collision, les deux clés partagent l'alvéole 2
print(alveoles)
# [[], [], [['pomme', 2], ['prune', 5]], [['poire', 4]], [['kiwi', 3]], []]
```

## À retenir

> - La notation O garde l'ordre de grandeur du coût dans le pire cas : O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ).
> - Recherche dichotomique sur un tableau trié : au plus ⌈log₂(n + 1)⌉ comparaisons, soit 10 pour 1 000 éléments.
> - Tri fusion : T(n) = 2T(n/2) + O(n), donc O(n log n) dans tous les cas. Tri rapide : O(n log n) en moyenne, O(n²) avec un pivot toujours extrême. Insertion et bulles : O(n²).
> - Tableau : accès O(1), insertion au début O(n). Liste chaînée : insertion en tête O(1), accès O(n). Pile = LIFO, file = FIFO ; en Python, `list` pour la pile et `collections.deque` pour la file.
> - ABR : recherche en O(h), O(log n) s'il est équilibré, O(n) s'il dégénère en liste ; le parcours infixe donne les clés triées.
> - Table de hachage : O(1) en moyenne, collisions gérées par chaînage ou adressage ouvert, O(n) si toutes les clés collisionnent.
> - Récursivité : un cas de base atteint à coup sûr, sinon la pile d'appels déborde.
