# Algèbre linéaire avancée : espaces, déterminants, spectre et SVD

Cette fiche reprend l'algèbre linéaire de première année d'école d'ingénieur sous l'angle des applications : changer de point de vue sur une transformation, mesurer comment elle déforme l'espace, puis la décomposer en directions simples. Ces outils sont au cœur de l'apprentissage automatique, de l'analyse en composantes principales à la compression d'images.

## Espaces vectoriels

Un **espace vectoriel** est un ensemble stable par addition et par multiplication par un scalaire : $\mathbb{R}^n$, les polynômes, les matrices $m \times n$… Une **combinaison linéaire** de $v_1, \dots, v_k$ s'écrit $\lambda_1 v_1 + \dots + \lambda_k v_k$.

- Une famille est **libre** (linéairement indépendante) si $\lambda_1 v_1 + \dots + \lambda_k v_k = 0$ impose $\lambda_1 = \dots = \lambda_k = 0$. Elle est **liée** dès qu'un vecteur est combinaison linéaire des autres.
- Une famille est **génératrice** si tout vecteur de l'espace est une combinaison linéaire de ses vecteurs.
- Une **base** est une famille libre et génératrice. Toutes les bases ont le même nombre de vecteurs : c'est la **dimension**.

En dimension $n$, une famille libre de $n$ vecteurs est automatiquement une base. Exemple : le plan $F = \{(x, y, z) \in \mathbb{R}^3 : x - y + 2z = 0\}$ est de dimension 2, avec pour base $(1, 1, 0)$ et $(-2, 0, 1)$.

## Applications linéaires

Une application $f : E \to F$ est **linéaire** si $f(\lambda u + \mu v) = \lambda f(u) + \mu f(v)$. On lui associe deux sous-espaces :

- le **noyau** $\operatorname{Ker} f = \{u \in E : f(u) = 0\}$ ; $f$ est injective si et seulement si $\operatorname{Ker} f = \{0\}$ ;
- l'**image** $\operatorname{Im} f = \{f(u) : u \in E\}$, dont la dimension est le **rang** $\operatorname{rg} f$.

Le **théorème du rang** relie les deux, pour $E$ de dimension finie :

$$
\dim E = \dim \operatorname{Ker} f + \operatorname{rg} f
$$

Exemple : $f(x, y, z) = (x + 2y, z)$ de $\mathbb{R}^3$ dans $\mathbb{R}^2$. Le noyau impose $z = 0$ et $x = -2y$ : c'est la droite engendrée par $(-2, 1, 0)$. Le rang vaut donc $3 - 1 = 2$, et $f$ est surjective.

## Changement de base

La **matrice de passage** $P$ d'une base $\mathcal{B}$ vers une base $\mathcal{B}'$ a pour colonnes les vecteurs de $\mathcal{B}'$ écrits dans $\mathcal{B}$. Les coordonnées d'un même vecteur sont liées par $X = PX'$. Si $A$ représente un endomorphisme dans $\mathcal{B}$, sa matrice dans $\mathcal{B}'$ est :

$$
A' = P^{-1} A P
$$

Deux matrices liées ainsi sont dites **semblables** : elles décrivent la même transformation vue dans deux bases. Elles partagent le déterminant, la trace, le rang et le polynôme caractéristique, mais pas les vecteurs propres (ceux de $A'$ sont les $P^{-1}v$). Tout l'enjeu de la diagonalisation est de trouver la base où $A'$ est la plus simple possible.

## Déterminant

Pour une matrice carrée, le déterminant se calcule en $2 \times 2$ par $ad - bc$, et en $3 \times 3$ en développant selon la première ligne :

$$
\det \begin{pmatrix} a & b & c \\ d & e & f \\ g & h & i \end{pmatrix} = a(ei - fh) - b(di - fg) + c(dh - eg)
$$

Propriétés essentielles, pour $A$ et $B$ de taille $n \times n$ :

$$
\det(AB) = \det(A) \det(B), \qquad \det(A^\top) = \det(A), \qquad \det(cA) = c^n \det(A)
$$

- Échanger deux lignes change le signe ; ajouter à une ligne un multiple d'une autre ne change rien.
- Le déterminant d'une matrice triangulaire est le produit de ses coefficients diagonaux.
- **Interprétation géométrique** : $\lvert \det A \rvert$ est le facteur par lequel $A$ multiplie les aires (en 2D) ou les volumes (en 3D). La matrice diagonale de coefficients 2, 3 et 4 envoie le cube unité sur un pavé de volume $2 \times 3 \times 4 = 24$.
- **Inversibilité** : $A$ est inversible si et seulement si $\det(A) \neq 0$, et alors $\det(A^{-1}) = 1 / \det(A)$. Un déterminant nul signifie que $A$ écrase l'espace sur une dimension inférieure.

## Valeurs propres et vecteurs propres

Un vecteur **non nul** $v$ est vecteur propre de $A$, de valeur propre $\lambda$, si $Av = \lambda v$ : $A$ se contente d'étirer $v$. Les valeurs propres sont les racines du **polynôme caractéristique** :

$$
\chi_A(\lambda) = \det(A - \lambda I)
$$

$A$ est **diagonalisable** s'il existe une base de vecteurs propres. En les rangeant en colonnes dans $P$, et les valeurs propres correspondantes dans la matrice diagonale $D$ :

$$
A = P D P^{-1}
$$

C'est le cas si et seulement si la somme des dimensions des sous-espaces propres vaut $n$ ; avoir $n$ valeurs propres distinctes suffit. La diagonalisation simplifie les puissances : $A^k = P D^k P^{-1}$.

**Exemple complet.** Soit $A = \begin{pmatrix} 4 & 1 \\ 2 & 3 \end{pmatrix}$.

1. Polynôme caractéristique : $\chi_A(\lambda) = (4 - \lambda)(3 - \lambda) - 1 \cdot 2 = \lambda^2 - 7\lambda + 10 = (\lambda - 5)(\lambda - 2)$. Les valeurs propres sont $5$ et $2$ ; contrôle : leur somme vaut la trace $4 + 3 = 7$, leur produit le déterminant $12 - 2 = 10$.
2. Pour $\lambda = 5$ : $A - 5I = \begin{pmatrix} -1 & 1 \\ 2 & -2 \end{pmatrix}$ impose $-x + y = 0$, d'où $v_1 = (1, 1)$.
3. Pour $\lambda = 2$ : $A - 2I = \begin{pmatrix} 2 & 1 \\ 2 & 1 \end{pmatrix}$ impose $2x + y = 0$, d'où $v_2 = (1, -2)$.
4. Vérification : $Av_1 = (4 + 1, 2 + 3) = (5, 5) = 5 v_1$ et $Av_2 = (4 - 2, 2 - 6) = (2, -4) = 2 v_2$.

On obtient alors, avec $\det P = -2 - 1 = -3$ :

$$
P = \begin{pmatrix} 1 & 1 \\ 1 & -2 \end{pmatrix}, \quad D = \begin{pmatrix} 5 & 0 \\ 0 & 2 \end{pmatrix}, \quad P^{-1} = \frac{1}{3} \begin{pmatrix} 2 & 1 \\ 1 & -1 \end{pmatrix}, \quad PDP^{-1} = \frac{1}{3} \begin{pmatrix} 12 & 3 \\ 6 & 9 \end{pmatrix} = A
$$

**Matrices symétriques réelles** (théorème spectral) : si $A^\top = A$, ses valeurs propres sont réelles et elle se diagonalise dans une base orthonormée, $A = Q D Q^\top$ avec $Q^{-1} = Q^\top$. C'est le cas des matrices de covariance utilisées en ACP.

| Propriété | Déterminant | Valeurs propres |
|---|---|---|
| Lien entre les deux | $\det(A) = \lambda_1 \lambda_2 \cdots \lambda_n$ | $\operatorname{tr}(A) = \lambda_1 + \dots + \lambda_n$ |
| $A$ inversible | $\det(A) \neq 0$ | $0$ n'est pas valeur propre |
| Inverse $A^{-1}$ | $1 / \det(A)$ | les $1 / \lambda_i$ |
| Puissance $A^k$ | $\det(A)^k$ | les $\lambda_i^k$ |
| Transposée $A^\top$ | inchangé | inchangées |
| Matrice semblable $P^{-1}AP$ | inchangé | inchangées |
| Matrice triangulaire | produit des coefficients diagonaux | les coefficients diagonaux |

(Les valeurs propres sont comptées avec leur multiplicité, éventuellement complexes.)

## Décomposition en valeurs singulières (SVD)

Toute matrice réelle $A$ de taille $m \times n$, même non carrée, se factorise en :

$$
A = U \Sigma V^\top
$$

avec $U$ ($m \times m$) et $V$ ($n \times n$) orthogonales, et $\Sigma$ ($m \times n$) nulle hors de sa diagonale, qui porte les **valeurs singulières** $\sigma_1 \geq \sigma_2 \geq \dots \geq 0$. Ce sont les racines carrées des valeurs propres de $A^\top A$.

- Le **rang** de $A$ est le nombre de valeurs singulières non nulles.
- **Compression** : en ne gardant que les $k$ plus grandes, $A_k = \sum_{i=1}^{k} \sigma_i u_i v_i^\top$ est la meilleure approximation de rang $k$ de $A$ (théorème d'Eckart-Young). On stocke $k(m + n + 1)$ nombres au lieu de $mn$ : pour une image $1000 \times 800$ et $k = 50$, cela fait $90\,050$ nombres au lieu de $800\,000$.

```python
import numpy as np

A = np.array([[4.0, 1.0],
              [2.0, 3.0]])

# Valeurs propres et vecteurs propres (normalisés, rangés en colonnes)
valeurs, vecteurs = np.linalg.eig(A)
print(valeurs)                   # [5. 2.]
print(np.round(vecteurs, 4))     # [[ 0.7071 -0.4472]
                                 #  [ 0.7071  0.8944]]
# Colonnes proportionnelles à v1 = (1, 1) et v2 = (1, -2) : seul le signe change

# Vérification de A = P D P^-1
P, D = vecteurs, np.diag(valeurs)
print(np.allclose(P @ D @ np.linalg.inv(P), A))   # True

# SVD d'une matrice 3x2 de rang 1 (2e colonne = 2 fois la 1re)
B = np.array([[1.0, 2.0], [2.0, 4.0], [3.0, 6.0]])
U, S, Vt = np.linalg.svd(B)
print(np.round(S, 4))            # [8.3666 0.    ]  (8.3666 ≈ racine de 70)
print(np.linalg.matrix_rank(B))  # 1
```

## À retenir

> - Base = famille libre et génératrice ; la dimension est le nombre de vecteurs d'une base.
> - Théorème du rang : $\dim E = \dim \operatorname{Ker} f + \operatorname{rg} f$ ; injective si et seulement si $\operatorname{Ker} f = \{0\}$.
> - Changer de base transforme $A$ en $P^{-1}AP$ : déterminant, trace et valeurs propres ne bougent pas.
> - $\det(AB) = \det(A)\det(B)$ ; $\lvert \det A \rvert$ mesure la déformation des aires et volumes ; $\det A \neq 0$ si et seulement si $A$ est inversible.
> - $Av = \lambda v$, racines de $\det(A - \lambda I)$ ; diagonaliser, c'est écrire $A = PDP^{-1}$. Toute matrice symétrique réelle l'est, en base orthonormée.
> - SVD : $A = U\Sigma V^\top$ pour toute matrice ; le rang compte les $\sigma_i$ non nulles, et la troncature aux $k$ plus grandes compresse au mieux.
