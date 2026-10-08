# Apprentissage automatique classique : régression, classification et clustering

Un algorithme d'apprentissage automatique ajuste les paramètres d'un modèle à partir d'exemples, au lieu de suivre des règles écrites à la main. Cette fiche présente les grandes familles de méthodes classiques, de la régression linéaire aux forêts aléatoires, puis les outils pour évaluer honnêtement un modèle.

## Supervisé ou non supervisé

- En **apprentissage supervisé**, chaque exemple $x_i$ est accompagné de la réponse attendue $y_i$, son **étiquette**. On parle de **régression** si $y$ est un nombre (un prix, une température) et de **classification** si $y$ est une catégorie (spam ou non, chiffre de 0 à 9).
- En **apprentissage non supervisé**, les données n'ont pas d'étiquette : on cherche une structure, par exemple des groupes (**clustering**) ou une représentation plus compacte (**réduction de dimension**). Dans les deux cas, un modèle se juge à sa capacité à **généraliser** à des données qu'il n'a jamais vues.

## Régression linéaire et moindres carrés

On cherche une droite $\hat{y} = ax + b$ qui colle au mieux à $n$ points $(x_i, y_i)$. La méthode des **moindres carrés** choisit $a$ et $b$ qui minimisent l'erreur quadratique moyenne :

$$
\text{MSE} = \frac{1}{n} \sum_{i=1}^{n} \left( y_i - \hat{y}_i \right)^2
$$

En annulant les dérivées partielles de la MSE par rapport à $a$ et à $b$, on obtient :

$$
a = \frac{\sum_i (x_i - \bar{x})(y_i - \bar{y})}{\sum_i (x_i - \bar{x})^2} = \frac{\operatorname{cov}(x, y)}{\operatorname{var}(x)}, \qquad b = \bar{y} - a \, \bar{x}
$$

La droite passe donc toujours par le point moyen $(\bar{x}, \bar{y})$. **Exemple** avec les points $(1, 2)$, $(2, 3)$ et $(3, 5)$ :

1. Moyennes : $\bar{x} = 2$ et $\bar{y} = \frac{2 + 3 + 5}{3} = \frac{10}{3}$.
2. Écarts : $x_i - \bar{x} = (-1, 0, 1)$ et $y_i - \bar{y} = \left( -\frac{4}{3}, -\frac{1}{3}, \frac{5}{3} \right)$.
3. Pente : $a = \dfrac{\frac{4}{3} + 0 + \frac{5}{3}}{1 + 0 + 1} = \dfrac{3}{2}$, puis ordonnée à l'origine : $b = \frac{10}{3} - \frac{3}{2} \times 2 = \frac{1}{3}$.

La droite des moindres carrés est $y = 1{,}5x + \frac{1}{3}$. Ses résidus valent $\frac{1}{6}$, $-\frac{1}{3}$ et $\frac{1}{6}$, de somme nulle, et sa MSE vaut $\frac{1}{18} \approx 0{,}056$.

## Régression logistique

Pour une classification binaire ($y \in \{0, 1\}$), on transforme le score linéaire $z = w^\top x + b$ en probabilité avec la **sigmoïde** :

$$
\sigma(z) = \frac{1}{1 + e^{-z}}, \qquad p = P(y = 1 \mid x) = \sigma(w^\top x + b)
$$

La sigmoïde vaut $0{,}5$ en $z = 0$, tend vers $1$ quand $z \to +\infty$ et vers $0$ quand $z \to -\infty$. Avec le seuil $p \geq 0{,}5$, la frontière de décision est l'hyperplan $w^\top x + b = 0$ : le modèle reste un classifieur **linéaire**. On l'entraîne en minimisant la **log-loss**, ou entropie croisée binaire :

$$
\mathcal{L} = -\frac{1}{n} \sum_{i=1}^{n} \Big[ y_i \ln p_i + (1 - y_i) \ln (1 - p_i) \Big]
$$

Pour un exemple de classe 1 prédit avec $p = 0{,}9$, la perte vaut $-\ln 0{,}9 \approx 0{,}105$ ; si la vraie classe est $0$, elle vaut $-\ln 0{,}1 \approx 2{,}303$. Une erreur commise avec assurance coûte donc très cher. Cette perte est convexe en $(w, b)$ : la descente de gradient atteint le minimum global.

## KNN et SVM

Le **KNN** (k plus proches voisins) n'a pas de phase d'entraînement : pour classer un point, il cherche les $k$ exemples les plus proches, le plus souvent en distance euclidienne, et retient la classe majoritaire parmi eux (ou leur moyenne en régression). Un petit $k$ donne une frontière irrégulière, sensible au bruit ; un grand $k$ la lisse, au risque d'effacer des détails utiles.

Le **SVM** (machine à vecteurs de support) cherche, parmi les hyperplans qui séparent deux classes étiquetées $y_i = \pm 1$, celui dont la **marge** est la plus large. Cette marge vaut $2 / \lVert w \rVert$, d'où le problème :

$$
\min_{w, b} \; \frac{1}{2} \lVert w \rVert^2 \quad \text{sous les contraintes} \quad y_i \left( w^\top x_i + b \right) \geq 1 \text{ pour tout } i
$$

Seuls les points situés sur la marge, les **vecteurs de support**, déterminent la solution. La **marge souple** tolère quelques points mal placés, avec une pénalité réglée par un hyperparamètre $C$. Enfin, l'**astuce du noyau** remplace les produits scalaires $x_i^\top x_j$ par un noyau $K(x_i, x_j)$, par exemple gaussien : on obtient une frontière non linéaire sans calculer explicitement de nouvelles variables.

## Arbres de décision et forêts aléatoires

Un **arbre de décision** pose une suite de questions simples (« $x_3 \leq 2{,}5$ ? ») jusqu'à une feuille qui donne la prédiction. À chaque nœud, il choisit la division qui rend les sous-groupes les plus **purs**, au sens de l'impureté de Gini $G = 1 - \sum_k p_k^2$, où $p_k$ est la proportion de la classe $k$ dans le nœud. Un nœud pur a $G = 0$, et un nœud à 5 exemples de chaque classe a $G = 1 - 0{,}5^2 - 0{,}5^2 = 0{,}5$.

Un arbre profond peut isoler chaque exemple d'entraînement dans sa propre feuille : il surapprend. La **forêt aléatoire** combine donc de nombreux arbres. Chacun apprend sur un échantillon **bootstrap**, tiré avec remise dans les données (c'est le **bagging**), et ne considère, à chaque division, qu'un **sous-ensemble aléatoire de variables**. La prédiction finale est le vote majoritaire (classification) ou la moyenne (régression) de ces arbres peu corrélés, ce qui réduit la variance sans beaucoup augmenter le biais.

## K-Means et ACP

**K-Means** répartit $n$ points en $k$ groupes. Après avoir choisi $k$ centres initiaux, il alterne deux étapes : l'**affectation** de chaque point au centre le plus proche, puis la **mise à jour** de chaque centre au barycentre de son groupe. Aucune des deux ne peut augmenter l'**inertie**, la somme des carrés des distances des points à leur centre, et le nombre de partitions possibles est fini : l'algorithme s'arrête toujours. Il peut cependant s'arrêter dans un minimum local ; on le relance donc avec plusieurs initialisations, et on choisit $k$ par exemple avec la méthode du coude.

L'**ACP** (analyse en composantes principales, PCA) réduit la dimension. On centre les données, on calcule leur matrice de covariance, puis ses vecteurs propres : ce sont les **composantes principales**, des directions orthogonales classées par variance décroissante. Si $\lambda_1 \geq \dots \geq \lambda_d$ sont les valeurs propres, la part de variance expliquée par la composante $j$ vaut $\lambda_j / \sum_i \lambda_i$. On garde les premières composantes, par exemple jusqu'à expliquer 95 % de la variance.

## Normalisation des données

Les méthodes fondées sur des distances (KNN, K-Means, SVM), l'ACP et la descente de gradient sont sensibles à l'échelle des variables : un revenu en euros, qui varie de plusieurs milliers, écraserait une taille en mètres. On met donc les variables à la même échelle, par **standardisation** $x' = (x - \mu) / \sigma$ (moyenne 0, écart-type 1) ou par **normalisation min-max** $x' = (x - x_{\min}) / (x_{\max} - x_{\min})$, qui ramène les valeurs dans $[0, 1]$.

Ces paramètres se calculent **sur le jeu d'entraînement seul**, puis s'appliquent tels quels aux données de validation et de test ; sinon, des informations du test fuient dans l'entraînement. Les arbres de décision, eux, n'en ont pas besoin : leurs seuils ne dépendent que de l'ordre des valeurs.

## Évaluer un modèle

**Validation croisée.** On met d'abord de côté un jeu de **test**, utilisé une seule fois à la fin. Pour choisir les hyperparamètres ($k$ du KNN, profondeur d'un arbre…), la validation croisée à $K$ plis découpe le reste en $K$ parts : le modèle est entraîné $K$ fois, chaque part servant une fois de validation, et on fait la moyenne des $K$ scores.

**Biais et variance.** Un modèle trop simple a un **biais** élevé : il sous-apprend et se trompe déjà sur l'entraînement. Un modèle trop complexe a une **variance** élevée : il **surapprend** (overfitting), avec un excellent score d'entraînement et un score de validation nettement plus faible. Régulariser, simplifier le modèle ou ajouter des données réduit la variance.

**Matrice de confusion.** Pour une classification binaire, on compte les vrais positifs (VP), faux positifs (FP), faux négatifs (FN) et vrais négatifs (VN). Exemple sur 100 exemples :

| | Prédit positif | Prédit négatif |
|---|---|---|
| **Réellement positif** | VP = 40 | FN = 20 |
| **Réellement négatif** | FP = 10 | VN = 30 |

- **précision** $P = \frac{VP}{VP + FP} = \frac{40}{50} = 0{,}80$ : parmi les prédictions positives, la part qui est juste ;
- **rappel** $R = \frac{VP}{VP + FN} = \frac{40}{60} \approx 0{,}667$ : parmi les exemples réellement positifs, la part détectée ;
- **exactitude** $= \frac{VP + VN}{100} = \frac{70}{100} = 0{,}70$ : la part de prédictions justes, toutes classes confondues.

Le **score F1** est la moyenne harmonique de la précision et du rappel :

$$
F_1 = \frac{2 P R}{P + R} = \frac{2 \times 0{,}8 \times \frac{2}{3}}{0{,}8 + \frac{2}{3}} = \frac{8}{11} \approx 0{,}727
$$

L'exactitude est trompeuse quand les classes sont déséquilibrées : avec 99 % de négatifs, un modèle qui répond toujours « négatif » atteint 99 % d'exactitude, pour un rappel nul.

## En pratique avec NumPy

Le code suivant retrouve la droite de l'exemple avec `np.polyfit`, puis programme K-Means à la main sur 6 points formant deux nuages.

```python
import numpy as np

# 1. Régression linéaire par moindres carrés
x = np.array([1.0, 2.0, 3.0])
y = np.array([2.0, 3.0, 5.0])
a, b = np.polyfit(x, y, deg=1)    # pente, puis ordonnée à l'origine
print(round(a, 4), round(b, 4))                  # 1.5 0.3333
print(round(np.mean((a * x + b - y) ** 2), 4))   # 0.0556  (MSE = 1/18)

# 2. K-Means à 2 groupes, écrit à la main
X = np.array([[1, 2], [2, 1], [3, 3],
              [8, 8], [9, 10], [10, 9]], dtype=float)
k = 2
rng = np.random.default_rng(0)
centres = X[rng.choice(len(X), size=k, replace=False)]   # k points de départ
print(centres.tolist())        # [[9.0, 10.0], [8.0, 8.0]]
for it in range(1, 101):
    d = np.linalg.norm(X[:, None, :] - centres[None, :, :], axis=2)  # (6, k)
    labels = d.argmin(axis=1)                    # affectation au centre le plus proche
    nouveaux = np.array([X[labels == j].mean(axis=0) for j in range(k)])
    if np.allclose(nouveaux, centres):           # les centres ne bougent plus
        break
    centres = nouveaux                           # mise à jour : barycentres

print(it, labels)              # 3 [1 1 1 0 0 0]
print(centres.tolist())        # [[9.0, 9.0], [2.0, 2.0]]
print(np.sum((X - centres[labels]) ** 2))        # 8.0  (inertie)
```

Les deux centres de départ tombent dans le même nuage : au premier passage, le point $(8, 8)$ rejoint donc le groupe du bas, puis il est réaffecté. À la 3ᵉ itération, les centres $(2, 2)$ et $(9, 9)$ ne bougent plus ; les numéros de groupe, 0 ou 1, sont arbitraires.

## Panorama des algorithmes

| Algorithme | Supervisé ou non | Type de tâche | Idée clé |
|---|---|---|---|
| Régression linéaire | supervisé | régression | droite (ou hyperplan) qui minimise la MSE |
| Régression logistique | supervisé | classification | sigmoïde d'un score linéaire, entraînée par log-loss |
| KNN | supervisé | classification ou régression | vote des $k$ voisins les plus proches |
| SVM | supervisé | classification | hyperplan à marge maximale, noyaux pour le non-linéaire |
| Arbre de décision | supervisé | classification ou régression | questions successives qui réduisent l'impureté |
| Forêt aléatoire | supervisé | classification ou régression | vote d'arbres décorrélés par bagging |
| K-Means | non supervisé | clustering | centres déplacés aux barycentres de leurs groupes |
| ACP | non supervisé | réduction de dimension | projection sur les directions de variance maximale |

## À retenir

> - Supervisé : chaque exemple a une étiquette (régression ou classification) ; non supervisé : on cherche une structure (clustering, réduction de dimension).
> - Moindres carrés : on minimise la MSE ; la droite passe par $(\bar{x}, \bar{y})$, avec $a = \operatorname{cov}(x, y) / \operatorname{var}(x)$.
> - Régression logistique : $p = \sigma(w^\top x + b)$, entraînée par la log-loss, qui est convexe.
> - SVM : marge maximale, solution fixée par les vecteurs de support ; forêt aléatoire : arbres décorrélés par bagging, dont la moyenne réduit la variance.
> - KNN, K-Means, SVM et ACP dépendent de l'échelle : on normalise, avec des paramètres calculés sur l'entraînement seul.
> - Surapprentissage : excellent score d'entraînement, score de validation nettement plus faible ; la validation croisée le révèle.
> - Précision $= VP/(VP + FP)$, rappel $= VP/(VP + FN)$, F1 = leur moyenne harmonique ; l'exactitude trompe sur des classes déséquilibrées.
