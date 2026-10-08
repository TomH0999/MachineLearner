# Mathématiques du BUT : logique, ensembles, matrices

Cette fiche rassemble les outils mathématiques de base utilisés partout en informatique : raisonner juste, manipuler des collections d'objets, calculer avec des tableaux de nombres et estimer des chances. Chaque notion est illustrée par un exemple court, à refaire à la main avant de passer au quiz.

## Logique propositionnelle

Une **proposition** est un énoncé soit vrai (V), soit faux (F). On les combine avec des connecteurs : la négation $\neg p$, la conjonction $p \land q$ (« et »), la disjonction $p \lor q$ (« ou » inclusif) et l'implication $p \Rightarrow q$.

L'implication n'est fausse que dans un seul cas : quand $p$ est vraie et $q$ fausse.

| $p$ | $q$ | $p \Rightarrow q$ |
|:---:|:---:|:---:|
| V | V | V |
| V | F | F |
| F | V | V |
| F | F | V |

Équivalences à connaître :

- $p \Rightarrow q$ équivaut à $\neg p \lor q$ ;
- la **contraposée** $\neg q \Rightarrow \neg p$ a la même table de vérité que $p \Rightarrow q$ ;
- lois de De Morgan : $\neg(p \land q) \equiv \neg p \lor \neg q$ et $\neg(p \lor q) \equiv \neg p \land \neg q$.

En programmation, `!(a && b)` s'écrit donc aussi `!a || !b`.

## Ensembles

Un **ensemble** est une collection d'éléments distincts, sans ordre. Avec $A = \{1, 2, 3, 4\}$ et $B = \{3, 4, 5\}$ :

- union : $A \cup B = \{1, 2, 3, 4, 5\}$ ;
- intersection : $A \cap B = \{3, 4\}$ ;
- différence : $A \setminus B = \{1, 2\}$ ;
- produit cartésien : $A \times B$ contient tous les couples $(a, b)$, soit $4 \times 3 = 12$ éléments.

Le cardinal d'une union se calcule sans compter deux fois l'intersection : $|A \cup B| = |A| + |B| - |A \cap B| = 4 + 3 - 2 = 5$.

L'**ensemble des parties** $\mathcal{P}(E)$ regroupe tous les sous-ensembles de $E$. Si $E$ a $n$ éléments, alors $|\mathcal{P}(E)| = 2^n$ : chaque élément est soit dans le sous-ensemble, soit dehors. Pour $E = \{1, 2, 3\}$, on obtient $2^3 = 8$ parties : $\emptyset$, $\{1\}$, $\{2\}$, $\{3\}$, $\{1, 2\}$, $\{1, 3\}$, $\{2, 3\}$ et $E$.

## Matrices

Une matrice $m \times n$ est un tableau de $m$ lignes et $n$ colonnes. Une matrice carrée d'ordre 2 s'écrit :

$$
A = \begin{pmatrix} a & b \\ c & d \end{pmatrix}
$$

Son déterminant vaut $\det(A) = ad - bc$ ; la matrice est inversible si et seulement s'il est non nul.

Le produit $AB$ existe si le nombre de colonnes de $A$ est égal au nombre de lignes de $B$. Le coefficient $(i, j)$ du résultat vaut $\sum_k a_{ik} b_{kj}$ : on multiplie la ligne $i$ de $A$ par la colonne $j$ de $B$.

$$
\begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix} \begin{pmatrix} 5 & 6 \\ 7 & 8 \end{pmatrix}
= \begin{pmatrix} 1 \cdot 5 + 2 \cdot 7 & 1 \cdot 6 + 2 \cdot 8 \\ 3 \cdot 5 + 4 \cdot 7 & 3 \cdot 6 + 4 \cdot 8 \end{pmatrix}
= \begin{pmatrix} 19 & 22 \\ 43 & 50 \end{pmatrix}
$$

Dans l'autre sens, $BA = \begin{pmatrix} 23 & 34 \\ 31 & 46 \end{pmatrix}$ : le produit matriciel **n'est pas commutatif**. En revanche, $\det(AB) = \det(A) \det(B)$ : ici $\det(A) = 4 - 6 = -2$, $\det(B) = 40 - 42 = -2$ et $\det(AB) = 950 - 946 = 4$.

```python
import numpy as np

# Les matrices A et B de l'exemple ci-dessus
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# Produit matriciel : opérateur @ (équivalent à np.matmul)
print(A @ B)             # [[19 22]
                         #  [43 50]]

# Piège classique : * multiplie terme à terme, ce n'est PAS le produit matriciel
print(A * B)             # [[ 5 12]
                         #  [21 32]]
```

La même chose en C, avec la triple boucle qui applique directement la définition :

```c
#include <stdio.h>

#define N 2

int main(void) {
    int A[N][N] = {{1, 2}, {3, 4}};
    int B[N][N] = {{5, 6}, {7, 8}};
    int C[N][N] = {{0}};

    /* C[i][j] = somme sur k de A[i][k] * B[k][j] */
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            for (int k = 0; k < N; k++)
                C[i][j] += A[i][k] * B[k][j];
        }
    }

    for (int i = 0; i < N; i++)
        printf("%d %d\n", C[i][0], C[i][1]); /* affiche "19 22" puis "43 50" */
    return 0;
}
```

## Probabilités simples

Sur un univers fini $\Omega$ dont les issues sont équiprobables, la probabilité d'un événement $A$ vaut :

$$
P(A) = \frac{|A|}{|\Omega|}
$$

- Dé équilibré à 6 faces : $P(\text{pair}) = \frac{3}{6} = \frac{1}{2}$.
- Deux dés : 36 issues, dont 6 donnent une somme de 7, donc $P(\text{somme} = 7) = \frac{6}{36} = \frac{1}{6}$.
- Événement contraire : $P(\bar{A}) = 1 - P(A)$. La probabilité d'obtenir au moins un 6 en deux lancers vaut $1 - \left(\frac{5}{6}\right)^2 = 1 - \frac{25}{36} = \frac{11}{36} \approx 0{,}31$.
- Deux événements sont **indépendants** si $P(A \cap B) = P(A) \times P(B)$.

## À retenir

> - $p \Rightarrow q$ n'est fausse que si $p$ est vraie et $q$ fausse ; elle équivaut à sa contraposée $\neg q \Rightarrow \neg p$.
> - $|A \cup B| = |A| + |B| - |A \cap B|$, et un ensemble à $n$ éléments a $2^n$ parties.
> - Le produit $AB$ se calcule ligne par colonne ; il n'est pas commutatif, mais $\det(AB) = \det(A) \det(B)$.
> - En cas d'équiprobabilité, $P(A) = |A| / |\Omega|$ ; pour « au moins un », passer par l'événement contraire.
