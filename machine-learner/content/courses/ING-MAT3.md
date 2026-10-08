# Analyse multivariée et optimisation : gradient, hessienne et descente de gradient

Entraîner un modèle d'apprentissage automatique revient à minimiser une fonction de coût qui dépend de milliers, voire de millions de paramètres. Cette fiche donne les outils pour trouver et classer les extremums d'une fonction de plusieurs variables, puis pour les atteindre numériquement par descente de gradient.

## Fonctions de plusieurs variables et dérivées partielles

Une fonction $f : \mathbb{R}^n \to \mathbb{R}$ associe un réel à un vecteur $x = (x_1, \dots, x_n)$. En 2D, son graphe est une surface, que l'on représente souvent par ses **lignes de niveau** $\{(x, y) : f(x, y) = c\}$, comme les courbes d'une carte topographique.

La **dérivée partielle** $\frac{\partial f}{\partial x_i}$ est la dérivée de $f$ par rapport à $x_i$, toutes les autres variables étant fixées. Exemple avec $f(x, y) = x^2 y + \sin y$ :

- $\frac{\partial f}{\partial x} = 2xy$, en traitant $y$ comme une constante ;
- $\frac{\partial f}{\partial y} = x^2 + \cos y$, en traitant $x$ comme une constante.

## Gradient

Le **gradient** rassemble les dérivées partielles en un vecteur :

$$
\nabla f(x) = \left( \frac{\partial f}{\partial x_1}(x), \dots, \frac{\partial f}{\partial x_n}(x) \right)
$$

Pour un vecteur unitaire $u$, la dérivée de $f$ dans la direction $u$ vaut $D_u f = \nabla f \cdot u = \lVert \nabla f \rVert \cos \theta$, où $\theta$ est l'angle entre $u$ et $\nabla f$. On en déduit trois propriétés :

- $\nabla f$ indique la direction de **plus forte pente** (croissance maximale de $f$), et $-\nabla f$ celle de plus forte descente ;
- $\lVert \nabla f \rVert$ mesure cette pente maximale ;
- $\nabla f$ est **orthogonal aux lignes de niveau** : le long d'une ligne de niveau, $f$ ne varie pas, donc $D_u f = 0$.

Un **point critique** est un point où $\nabla f = 0$. Tout extremum local d'une fonction différentiable sur $\mathbb{R}^n$ est un point critique, mais la réciproque est fausse.

## Matrice hessienne et nature des points critiques

La **matrice hessienne** contient les dérivées secondes. En 2D :

$$
H_f(x, y) = \begin{pmatrix} \dfrac{\partial^2 f}{\partial x^2} & \dfrac{\partial^2 f}{\partial x \, \partial y} \\ \dfrac{\partial^2 f}{\partial y \, \partial x} & \dfrac{\partial^2 f}{\partial y^2} \end{pmatrix}
$$

Pour $f$ de classe $C^2$, le théorème de Schwarz donne l'égalité des dérivées croisées : la hessienne est symétrique, donc diagonalisable avec des valeurs propres réelles $\lambda_1$ et $\lambda_2$. En un point critique, leurs signes donnent la nature du point. En 2D, il suffit de lire $\det H = \lambda_1 \lambda_2$ et $\operatorname{tr} H = \lambda_1 + \lambda_2$ :

| Signe de $\det(H)$ | Signe de $\operatorname{tr}(H)$ | Valeurs propres | Nature du point critique |
|---|---|---|---|
| $> 0$ | $> 0$ | toutes deux positives | minimum local |
| $> 0$ | $< 0$ | toutes deux négatives | maximum local |
| $< 0$ | quelconque | de signes opposés | point col (point selle) |
| $= 0$ | quelconque | au moins une nulle | test non concluant |

Si $\det(H) > 0$, la trace ne peut pas être nulle, car les deux valeurs propres ont le même signe. Exemple de col : $f(x, y) = x^2 - y^2$ en $(0, 0)$, minimum le long de l'axe des $x$ et maximum le long de l'axe des $y$.

## Développement de Taylor à l'ordre 2

Au voisinage d'un point $a$, pour un petit déplacement $h$ :

$$
f(a + h) = f(a) + \nabla f(a) \cdot h + \frac{1}{2} \, h^\top H_f(a) \, h + o(\lVert h \rVert^2)
$$

Le terme d'ordre 1 correspond au plan tangent. En un point critique, il s'annule et la forme quadratique $h^\top H h$ décide seule : si elle est strictement positive pour tout $h \neq 0$ (hessienne **définie positive**), $f$ remonte dans toutes les directions et $a$ est un minimum local. Pour un polynôme de degré 2, le développement est exact.

## Exemple complet

Soit $f(x, y) = x^2 + xy + y^2 - 3x$.

1. Gradient : $\nabla f(x, y) = (2x + y - 3, \; x + 2y)$.
2. Point critique : $x + 2y = 0$ donne $x = -2y$ ; en reportant, $-4y + y - 3 = 0$, soit $y = -1$ et $x = 2$. Contrôle : $\nabla f(2, -1) = (4 - 1 - 3, \; 2 - 2) = (0, 0)$.

La hessienne est ici constante :

$$
H = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}, \qquad \det H = 2 \times 2 - 1 \times 1 = 3 > 0, \qquad \operatorname{tr} H = 4 > 0
$$

Le point $(2, -1)$ est donc un **minimum** (valeurs propres $1$ et $3$), de valeur $f(2, -1) = 4 - 2 + 1 - 6 = -3$.

**Vérification.** Taylor à l'ordre 2 est exact pour ce polynôme, avec un gradient nul en $(2, -1)$ :

$$
f(2 + h, -1 + k) = -3 + h^2 + hk + k^2 = -3 + \left( h + \frac{k}{2} \right)^2 + \frac{3}{4} k^2 \geq -3
$$

L'égalité n'a lieu que pour $h = k = 0$ : le minimum est même **global**, ce qu'annonçait la convexité de $f$.

## Convexité

Une fonction $f$ est **convexe** si, pour tous points $x$, $y$ et tout $t \in [0, 1]$, $f(tx + (1 - t)y) \leq t f(x) + (1 - t) f(y)$ : toute corde reste au-dessus du graphe. Pour $f$ de classe $C^2$, c'est équivalent à une hessienne **semi-définie positive** en tout point ; en 2D, $\det H \geq 0$ et $\operatorname{tr} H \geq 0$.

Une fonction convexe est au-dessus de chacun de ses plans tangents : $f(x) \geq f(a) + \nabla f(a) \cdot (x - a)$. Conséquences :

- tout point critique est un **minimum global** ;
- tout minimum local est global : une descente ne peut pas rester piégée dans un « mauvais » creux.

C'est pourquoi la régression linéaire (coût quadratique) et la régression logistique sont faciles à optimiser, contrairement aux réseaux de neurones, dont la fonction de coût n'est pas convexe.

## Descente de gradient

Quand on ne sait pas résoudre $\nabla f = 0$ à la main, on part d'un point $\theta_0$ et on avance à petits pas dans la direction de plus forte descente :

$$
\theta_{k+1} = \theta_k - \eta \, \nabla f(\theta_k)
$$

Le **taux d'apprentissage** $\eta > 0$ règle la longueur des pas :

- **trop petit** : chaque pas est sûr mais minuscule, et la convergence est très lente ;
- **trop grand** : le pas saute par-dessus le minimum, la suite oscille puis diverge ;
- pour une fonction quadratique de hessienne $H$ définie positive, la descente converge depuis n'importe quel point si et seulement si $0 < \eta < 2 / \lambda_{\max}$, où $\lambda_{\max}$ est la plus grande valeur propre de $H$.

Sur l'exemple précédent, $\lambda_{\max} = 3$, donc il faut $\eta < 2/3$. Depuis $(0, 0)$, avec le critère d'arrêt du code ci-dessous, on mesure 1 450 itérations pour $\eta = 0{,}01$, 139 pour $\eta = 0{,}1$, 22 pour $\eta = 0{,}5$, et une divergence pour $\eta = 0{,}7$.

```python
import numpy as np

def f(theta):
    x, y = theta
    return x**2 + x*y + y**2 - 3*x

def grad_f(theta):
    x, y = theta
    return np.array([2*x + y - 3, x + 2*y])

theta = np.array([0.0, 0.0])   # point de départ
eta = 0.1                      # taux d'apprentissage
for k in range(1, 1001):
    theta = theta - eta * grad_f(theta)
    if np.linalg.norm(grad_f(theta)) < 1e-6:   # arrêt : gradient quasi nul
        break

print(k)                    # 139 itérations
print(np.round(theta, 6))   # [ 1.999999 -0.999999]  ≈ (2, -1)
print(round(f(theta), 6))   # -3.0
```

En apprentissage automatique, $f$ est la fonction de coût et $\theta$ le vecteur des paramètres du modèle. La descente de gradient stochastique estime $\nabla f$ sur un petit lot de données à chaque pas, ce qui rend chaque itération bien moins coûteuse.

## Optimisation sous contrainte : multiplicateurs de Lagrange

Pour optimiser $f(x, y)$ sous une contrainte $g(x, y) = 0$, on cherche les points où la ligne de niveau de $f$ est **tangente** à la courbe de contrainte : les deux gradients y sont colinéaires.

$$
\nabla f(x, y) = \lambda \, \nabla g(x, y), \qquad g(x, y) = 0
$$

On résout ce système de 3 équations à 3 inconnues $(x, y, \lambda)$, en supposant $\nabla g \neq 0$. Exemple : maximiser $f(x, y) = x + y$ sur le cercle unité, soit $g(x, y) = x^2 + y^2 - 1$.

- $\nabla f = (1, 1)$ et $\nabla g = (2x, 2y)$, donc $1 = 2\lambda x$ et $1 = 2\lambda y$, d'où $x = y$.
- La contrainte donne $2x^2 = 1$, soit $x = y = \pm \frac{1}{\sqrt{2}}$.
- Le maximum vaut $f\left(\frac{1}{\sqrt{2}}, \frac{1}{\sqrt{2}}\right) = \sqrt{2}$, et le point opposé donne le minimum $-\sqrt{2}$.

Cette méthode intervient aussi en apprentissage automatique, par exemple dans la formulation des machines à vecteurs de support (SVM).

## À retenir

> - $\nabla f$ pointe vers la plus forte croissance et est orthogonal aux lignes de niveau ; un point critique annule le gradient.
> - La hessienne, symétrique, classe les points critiques : en 2D, $\det H > 0$ et $\operatorname{tr} H > 0$ donnent un minimum, $\det H > 0$ et $\operatorname{tr} H < 0$ un maximum, $\det H < 0$ un col.
> - Taylor à l'ordre 2 : $f(a + h) \approx f(a) + \nabla f(a) \cdot h + \frac{1}{2} h^\top H h$.
> - Fonction convexe : hessienne semi-définie positive partout, et tout minimum local est global.
> - Descente de gradient : $\theta \leftarrow \theta - \eta \nabla f(\theta)$ ; $\eta$ trop petit ralentit, $\eta$ trop grand fait diverger ($\eta < 2 / \lambda_{\max}$ pour une quadratique).
> - Sous une contrainte $g = 0$, les extremums vérifient $\nabla f = \lambda \nabla g$.
