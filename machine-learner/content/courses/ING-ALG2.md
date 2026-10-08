# Mathématiques discrètes et théorie des langages : de la récurrence aux machines de Turing

Les mathématiques discrètes étudient des objets que l'on peut énumérer un à un : entiers, ensembles finis, relations, graphes et mots. Cette fiche en présente les outils de base, puis montre comment automates et grammaires classent les langages selon la puissance de calcul qu'il faut pour les reconnaître, jusqu'aux limites de ce qu'un ordinateur peut décider.

## Raisonnement par récurrence

Pour prouver qu'une propriété $P(n)$ est vraie pour tout entier $n \geq n_0$, on établit l'**initialisation**, $P(n_0)$ vraie, puis l'**hérédité** : pour tout $n \geq n_0$, si $P(n)$ est vraie, alors $P(n + 1)$ l'est aussi.

**Exemple.** Montrons que, pour tout $n \geq 1$ :

$$
\sum_{k=1}^{n} k = 1 + 2 + \dots + n = \frac{n(n+1)}{2}
$$

- Initialisation : pour $n = 1$, la somme vaut $1$, et $\frac{1 \times 2}{2} = 1$.
- Hérédité : supposons la formule vraie au rang $n$. En ajoutant le terme suivant :

$$
\sum_{k=1}^{n+1} k = \frac{n(n+1)}{2} + (n + 1) = \frac{n(n+1) + 2(n+1)}{2} = \frac{(n+1)(n+2)}{2}
$$

C'est bien la formule au rang $n + 1$ ; par exemple, $1 + 2 + \dots + 100 = 5050$. La **récurrence forte** suppose $P(n_0), \dots, P(n)$ toutes vraies pour établir $P(n + 1)$ : elle montre par exemple que tout entier $n \geq 2$ est un produit de nombres premiers. Attention, l'hérédité doit valoir pour **tout** $n \geq n_0$ : un seul rang où l'argument échoue, et la preuve ne vaut plus rien.

## Combinatoire

Le **principe multiplicatif** dit que $k$ choix successifs, offrant $n_1, n_2, \dots, n_k$ possibilités, donnent $n_1 \times n_2 \times \dots \times n_k$ résultats. On en déduit :

- les **arrangements**, suites ordonnées de $k$ éléments distincts pris parmi $n$ : $A(n, k) = n(n-1) \cdots (n-k+1) = \frac{n!}{(n-k)!}$, dont les $A(n, n) = n!$ **permutations** ;
- les **combinaisons**, sous-ensembles de $k$ éléments parmi $n$, sans ordre. Chaque sous-ensemble correspond à $k!$ arrangements, d'où :

$$
\binom{n}{k} = C(n, k) = \frac{A(n, k)}{k!} = \frac{n!}{k!\,(n-k)!}
$$

Ainsi, 5 coureurs donnent $A(5, 2) = 20$ podiums (or, argent) mais seulement $\binom{5}{2} = 10$ paires de coureurs. Les coefficients vérifient la relation de Pascal $\binom{n}{k} = \binom{n-1}{k-1} + \binom{n-1}{k}$, et un ensemble à $n$ éléments possède $\sum_{k=0}^{n} \binom{n}{k} = 2^n$ sous-ensembles.

**Principe des tiroirs.** Si l'on range $n + 1$ objets dans $n$ tiroirs, un tiroir au moins contient deux objets. Plus généralement, $N$ objets répartis dans $k$ tiroirs en placent au moins $\lceil N / k \rceil$ dans un même tiroir : parmi 13 personnes, deux au moins sont nées le même mois, et parmi 25, au moins trois.

## Relations : équivalence et ordre

Une relation binaire $\mathcal{R}$ sur un ensemble $E$ est **réflexive** si $x \mathcal{R} x$ pour tout $x$, **symétrique** si $x \mathcal{R} y$ entraîne $y \mathcal{R} x$, **antisymétrique** si $x \mathcal{R} y$ et $y \mathcal{R} x$ entraînent $x = y$, et **transitive** si $x \mathcal{R} y$ et $y \mathcal{R} z$ entraînent $x \mathcal{R} z$.

Une **relation d'équivalence** est réflexive, symétrique et transitive. Elle partitionne $E$ en **classes d'équivalence** disjointes : la congruence modulo 3 sur $\mathbb{Z}$ ($a \equiv b \pmod 3$ quand 3 divise $a - b$) a trois classes, celles des restes 0, 1 et 2.

Une **relation d'ordre** est réflexive, antisymétrique et transitive. L'ordre $\leq$ sur les réels est **total** : deux éléments sont toujours comparables. L'inclusion $\subseteq$ entre ensembles et la divisibilité sur $\mathbb{N}^*$ sont des ordres **partiels** : on n'a ni $\{1\} \subseteq \{2\}$ ni $\{2\} \subseteq \{1\}$, et 2 ne divise pas 3, qui ne divise pas 2.

## Graphes

Un **graphe** $G = (V, E)$ est formé de sommets $V$ et d'arêtes $E$, qui relient des paires de sommets. Le **degré** $\deg(v)$ d'un sommet est son nombre d'arêtes. Chaque arête ayant deux extrémités, elle compte deux fois dans la somme des degrés : c'est le **lemme des poignées de main**.

$$
\sum_{v \in V} \deg(v) = 2\,|E|
$$

Conséquence : tout graphe a un nombre **pair** de sommets de degré impair. Un **arbre** est un graphe connexe et sans cycle ; un arbre à $n$ sommets a exactement $n - 1$ arêtes. Pour un graphe à $n$ sommets, deux des trois propriétés « connexe », « sans cycle » et « $n - 1$ arêtes » entraînent la troisième. Retirer une arête d'un arbre le déconnecte, en ajouter une crée exactement un cycle.

## Automates finis

Un **automate fini déterministe** (AFD) est un quintuplet $(Q, \Sigma, \delta, q_0, F)$ : un ensemble fini d'états $Q$, un alphabet $\Sigma$, une fonction de transition $\delta : Q \times \Sigma \to Q$, un état initial $q_0$ et des états acceptants $F \subseteq Q$. Il lit un mot lettre par lettre, et le mot est **accepté** si la lecture se termine dans un état de $F$.

**Exemple : les mots sur $\{0, 1\}$ qui contiennent un nombre pair de 1.** L'état $q_0$ signifie « nombre pair de 1 lus jusqu'ici » et $q_1$ « nombre impair » : lire 0 laisse l'automate dans le même état, lire 1 le fait passer dans l'autre.

| État | Lecture de 0 | Lecture de 1 | Rôle |
|---|---|---|---|
| $q_0$ | $q_0$ | $q_1$ | initial et acceptant |
| $q_1$ | $q_1$ | $q_0$ | non acceptant |

- « 1001 » : $q_0 \xrightarrow{1} q_1 \xrightarrow{0} q_1 \xrightarrow{0} q_1 \xrightarrow{1} q_0$. La lecture finit dans $q_0$ : le mot est **accepté** (deux 1).
- « 1011 » : $q_0 \xrightarrow{1} q_1 \xrightarrow{0} q_1 \xrightarrow{1} q_0 \xrightarrow{1} q_1$. La lecture finit dans $q_1$ : le mot est **refusé** (trois 1).

Un **automate fini non déterministe** (AFN) peut avoir, pour un état et une lettre, plusieurs transitions ou aucune, ainsi que des $\varepsilon$-transitions qui ne lisent rien ; il accepte un mot si **au moins un** chemin de lecture mène à un état acceptant. Cette liberté ne donne aucune puissance supplémentaire : la **construction des sous-ensembles** fabrique un AFD dont chaque état est un ensemble d'états de l'AFN, soit au plus $2^{|Q|}$ états. AFD et AFN reconnaissent donc exactement les mêmes langages.

Le code suivant simule l'AFD avec un dictionnaire de transitions et affiche la trace de chaque lecture.

```python
# AFD « nombre pair de 1 » sur l'alphabet {0, 1}
transitions = {
    ("q0", "0"): "q0", ("q0", "1"): "q1",
    ("q1", "0"): "q1", ("q1", "1"): "q0",
}
initial, acceptants = "q0", {"q0"}

def executer(mot):
    etat, trace = initial, [initial]
    for symbole in mot:
        etat = transitions[(etat, symbole)]   # une seule transition possible
        trace.append(etat)
    return etat in acceptants, trace

for mot in ["1001", "1011", "", "0000"]:
    accepte, trace = executer(mot)
    print(repr(mot), " -> ".join(trace), "accepté" if accepte else "refusé")
# '1001' q0 -> q1 -> q1 -> q1 -> q0 accepté
# '1011' q0 -> q1 -> q1 -> q0 -> q1 refusé
# '' q0 accepté                  (mot vide : zéro 1, et zéro est pair)
# '0000' q0 -> q0 -> q0 -> q0 -> q0 accepté
```

## Langages réguliers et expressions régulières

Un **langage** est un ensemble de mots sur un alphabet. Les **expressions régulières** les décrivent avec trois opérations : l'union `a|b`, la concaténation `ab` et l'étoile de Kleene `a*` (zéro, une ou plusieurs répétitions). Exemples sur $\{0, 1\}$ :

- `(0|1)*1` : les mots qui se terminent par 1, c'est-à-dire les entiers impairs écrits en binaire ;
- `0*10*` : les mots qui contiennent exactement un 1 ;
- `(0*10*1)*0*` : les mots qui contiennent un nombre pair de 1, soit le langage de l'automate ci-dessus.

Le **théorème de Kleene** établit que les expressions régulières et les automates finis décrivent exactement les mêmes langages, appelés **langages réguliers**. Ceux-ci sont clos par union, concaténation, étoile, intersection et complémentaire : pour obtenir le complémentaire, il suffit d'échanger états acceptants et non acceptants dans un AFD complet.

## Lemme de pompage

Un automate à $p$ états qui lit un mot d'au moins $p$ lettres passe par au moins $p + 1$ états : d'après le principe des tiroirs, l'un d'eux revient deux fois. La portion lue entre ces deux passages forme une boucle, que l'on peut répéter ou supprimer. D'où le **lemme de pompage** : si $L$ est régulier, il existe un entier $p$ tel que tout mot $w \in L$ avec $|w| \geq p$ s'écrit $w = xyz$, avec

$$
|xy| \leq p, \qquad |y| \geq 1, \qquad x y^i z \in L \ \text{pour tout } i \geq 0
$$

**Application : $L = \{a^n b^n \mid n \geq 0\}$ n'est pas régulier.** Supposons-le régulier, de longueur de pompage $p$, et prenons $w = a^p b^p \in L$. Comme $|xy| \leq p$, les parties $x$ et $y$ ne contiennent que des $a$ : $y = a^k$ avec $k \geq 1$. Alors $x y^2 z = a^{p+k} b^p$ a plus de $a$ que de $b$ et n'appartient pas à $L$, ce qui contredit le lemme. Intuitivement, un automate fini ne peut pas compter un nombre arbitraire de $a$.

## Grammaires hors-contexte

Une **grammaire hors-contexte** se compose de symboles terminaux (les lettres), de non-terminaux (comme $S$), d'un axiome et de règles de la forme $A \to \alpha$, où $\alpha$ est une suite quelconque de symboles. Un mot appartient au langage engendré s'il s'obtient à partir de l'axiome en remplaçant, pas à pas, un non-terminal par le membre droit de l'une de ses règles.

La grammaire $S \to aSb \mid \varepsilon$ engendre exactement $\{a^n b^n \mid n \geq 0\}$, le langage non régulier de la section précédente. Dérivation de « aabb » :

$$
S \Rightarrow aSb \Rightarrow aaSbb \Rightarrow aabb
$$

On applique deux fois $S \to aSb$, puis $S \to \varepsilon$. Les langages hors-contexte sont reconnus par les **automates à pile** : ici, l'automate empile un symbole par $a$ lu, en dépile un par $b$, refuse tout $a$ qui suit un $b$, et accepte si la pile est vide à la fin du mot. Ces grammaires décrivent la syntaxe des langages de programmation (parenthèses équilibrées, blocs imbriqués) et sont au cœur des analyseurs syntaxiques des compilateurs.

## Hiérarchie de Chomsky

Noam Chomsky a classé les grammaires selon la forme de leurs règles. Chaque classe de langages est strictement incluse dans celle du niveau suivant, et chacune correspond à un modèle de machine :

| Niveau | Grammaire (forme des règles) | Automate | Exemple de langage |
|---|---|---|---|
| Type 3 : régulier | $A \to aB$, $A \to a$ ou $A \to \varepsilon$ | automate fini | mots avec un nombre pair de 1 |
| Type 2 : hors-contexte | $A \to \alpha$ | automate à pile | $\{a^n b^n \mid n \geq 0\}$ |
| Type 1 : contextuel | $\alpha A \beta \to \alpha \gamma \beta$, avec $\gamma$ non vide | automate linéairement borné | $\{a^n b^n c^n \mid n \geq 1\}$ |
| Type 0 : récursivement énumérable | règles sans restriction | machine de Turing | couples (programme, entrée) qui s'arrêtent |

## Machines de Turing et indécidabilité

Une **machine de Turing** dispose d'un ruban infini découpé en cases, d'une tête de lecture et d'écriture qui se déplace d'une case à gauche ou à droite, et d'un nombre fini d'états. À chaque étape, selon son état et le symbole lu, elle écrit un symbole, déplace sa tête et change d'état. La **thèse de Church-Turing** affirme que tout ce qu'un algorithme peut calculer, une machine de Turing le peut aussi ; une **machine universelle** simule d'ailleurs n'importe quelle autre machine à partir de sa description.

Un problème est **décidable** si une machine de Turing répond « oui » ou « non » en temps fini sur toute entrée. Le **problème de l'arrêt** ne l'est pas. Supposons qu'un programme $H(P, x)$ dise toujours correctement si le programme $P$ s'arrête sur l'entrée $x$, et construisons le programme $D$ qui, sur l'entrée $P$, boucle indéfiniment si $H(P, P)$ répond « oui » et s'arrête sinon.

Que fait $D(D)$ ? S'il s'arrête, c'est que $H(D, D)$ a répondu « non », donc prédit qu'il boucle ; s'il boucle, c'est que $H$ a répondu « oui ». Dans les deux cas $H$ se trompe : il ne peut pas exister. Par réduction depuis l'arrêt, bien d'autres questions sont indécidables, comme savoir si deux programmes calculent la même fonction ; le **théorème de Rice** généralise : toute propriété non triviale du comportement d'un programme est indécidable.

## À retenir

> - Récurrence : initialisation, puis hérédité pour **tout** $n \geq n_0$ ; exemple : $\sum_{k=1}^{n} k = \frac{n(n+1)}{2}$.
> - Arrangements $A(n, k) = \frac{n!}{(n-k)!}$ quand l'ordre compte, combinaisons $\binom{n}{k} = \frac{n!}{k!\,(n-k)!}$ sinon ; $n + 1$ objets dans $n$ tiroirs : un tiroir en contient deux.
> - Équivalence : réflexive, symétrique, transitive (classes disjointes) ; ordre : réflexif, antisymétrique, transitif (total ou partiel). Graphes : $\sum_{v} \deg(v) = 2|E|$, et un arbre à $n$ sommets a $n - 1$ arêtes.
> - AFD, AFN et expressions régulières décrivent les mêmes langages, les réguliers ; le lemme de pompage prouve que $a^n b^n$ n'en fait pas partie.
> - Chomsky : réguliers (automates finis) ⊂ hors-contexte (automates à pile) ⊂ contextuels ⊂ récursivement énumérables (machines de Turing).
> - Le problème de l'arrêt est indécidable : aucun algorithme ne le résout pour tous les programmes et toutes les entrées.
