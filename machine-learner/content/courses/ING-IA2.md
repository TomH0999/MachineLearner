# Apprentissage profond : réseaux de neurones, rétropropagation et architectures

Un réseau de neurones empile des couches de calculs simples, dont les paramètres, parfois des milliards, sont ajustés par descente de gradient. Cette fiche décrit le neurone artificiel, le calcul des gradients par rétropropagation, puis les architectures qui dominent l'apprentissage profond : CNN, RNN et Transformers.

## Le neurone artificiel et le perceptron multicouche

Un **neurone** calcule une somme pondérée de ses entrées, ajoute un biais, puis applique une **fonction d'activation** $f$ :

$$
a = f\left( w^\top x + b \right) = f\left( \sum_{j} w_j x_j + b \right)
$$

Un **perceptron multicouche** (MLP) empile des couches de neurones : chaque couche $\ell$ reçoit toutes les sorties de la précédente, soit $a^{(\ell)} = f\left( W^{(\ell)} a^{(\ell - 1)} + b^{(\ell)} \right)$ avec une matrice de poids $W^{(\ell)}$. Une couche dense de $n$ entrées vers $m$ neurones compte $m(n + 1)$ paramètres : $n$ poids et un biais par neurone.

## Fonctions d'activation

Sans activation non linéaire, empiler des couches ne sert à rien : une composition de transformations affines reste affine. Les activations courantes sont :

- **ReLU** : $\max(0, z)$, de dérivée 1 pour $z > 0$ et 0 sinon ; c'est le choix par défaut dans les couches cachées ;
- **sigmoïde** : $\sigma(z) = 1/(1 + e^{-z})$, à valeurs dans $]0, 1[$, pour une probabilité binaire en sortie ;
- **tanh** : à valeurs dans $]-1, 1[$ et centrée en 0. Sigmoïde et tanh **saturent** quand $|z|$ est grand : leur dérivée y devient presque nulle.

Pour une classification à $K$ classes, la couche de sortie applique la **softmax**, qui transforme des scores (logits) en probabilités positives de somme 1 :

$$
\operatorname{softmax}(z)_i = \frac{e^{z_i}}{\sum_{k=1}^{K} e^{z_k}}
$$

Exemple : pour $z = (1, 2, 3)$, les exponentielles valent environ $2{,}718$, $7{,}389$ et $20{,}086$, de somme $30{,}193$, d'où $\operatorname{softmax}(1, 2, 3) \approx (0{,}090 \,;\, 0{,}245 \,;\, 0{,}665)$. Ajouter une même constante à tous les scores ne change pas le résultat : on peut donc soustraire $\max_k z_k$ avant l'exponentielle, pour éviter un dépassement de capacité.

## Fonctions de perte

Pour une **régression**, on minimise l'erreur quadratique moyenne $\frac{1}{n} \sum_i (y_i - \hat{y}_i)^2$. Pour une **classification**, on utilise l'**entropie croisée** entre la cible one-hot $y$ et les probabilités prédites $p$ :

$$
\mathcal{L} = -\sum_{k=1}^{K} y_k \ln p_k = -\ln p_c
$$

où $c$ est la vraie classe. Cette perte est nulle si le modèle donne la probabilité 1 à la bonne classe, et tend vers l'infini quand cette probabilité tend vers 0. Associée à une softmax, son gradient par rapport aux scores est simplement $p - y$.

## Rétropropagation

Pour ajuster les poids, il faut la dérivée de la perte par rapport à chacun d'eux. La **rétropropagation** applique la règle de dérivation en chaîne de la sortie vers l'entrée : chaque couche multiplie le gradient reçu par sa dérivée locale, puis le transmet à la couche précédente.

**Exemple sur un neurone ReLU.** Entrée $x = (1, 2)$, poids $w = (0{,}5 \,;\, -0{,}25)$, biais $b = 0{,}1$, cible $y = 1$ et perte $L = \frac{1}{2}(a - y)^2$.

1. **Propagation avant** : $z = 0{,}5 \times 1 - 0{,}25 \times 2 + 0{,}1 = 0{,}1$, puis $a = \operatorname{ReLU}(0{,}1) = 0{,}1$ et $L = \frac{1}{2}(0{,}1 - 1)^2 = 0{,}405$.
2. **Vers l'arrière** : $\frac{\partial L}{\partial a} = a - y = -0{,}9$ ; comme $z > 0$, $\frac{\partial a}{\partial z} = 1$, donc $\frac{\partial L}{\partial z} = -0{,}9$.
3. **Gradients des paramètres** : $\frac{\partial z}{\partial w} = x$ et $\frac{\partial z}{\partial b} = 1$, d'où $\frac{\partial L}{\partial w} = -0{,}9 \times (1, 2) = (-0{,}9 \,;\, -1{,}8)$ et $\frac{\partial L}{\partial b} = -0{,}9$.
4. **Mise à jour** avec $\eta = 0{,}1$ : $w \leftarrow (0{,}5 + 0{,}09 \,;\, -0{,}25 + 0{,}18) = (0{,}59 \,;\, -0{,}07)$ et $b \leftarrow 0{,}1 + 0{,}09 = 0{,}19$.

Nouvelle propagation avant : $z = 0{,}59 - 0{,}14 + 0{,}19 = 0{,}64$, donc $L = \frac{1}{2}(0{,}64 - 1)^2 = 0{,}0648$. Un seul pas a divisé la perte par plus de 6. Le code suivant refait ce calcul, puis programme une softmax stable.

```python
import numpy as np

# 1. Une étape de rétropropagation sur un neurone ReLU
x = np.array([1.0, 2.0])
w = np.array([0.5, -0.25])
b, y, eta = 0.1, 1.0, 0.1

z = w @ x + b                     # propagation avant
a = max(z, 0.0)                   # ReLU
L = 0.5 * (a - y) ** 2
print(round(z, 4), round(a, 4), round(L, 4))     # 0.1 0.1 0.405

dL_da = a - y                     # rétropropagation (règle de la chaîne)
dL_dz = dL_da * (1.0 if z > 0 else 0.0)          # ReLU'(z)
dL_dw = dL_dz * x
dL_db = dL_dz
print(round(dL_da, 4), dL_dw, round(dL_db, 4))   # -0.9 [-0.9 -1.8] -0.9

w = w - eta * dL_dw               # mise à jour
b = b - eta * dL_db
print(w, round(b, 4))                            # [ 0.59 -0.07] 0.19

a = max(w @ x + b, 0.0)
print(round(0.5 * (a - y) ** 2, 4))              # 0.0648  (nouvelle perte)

# 2. Softmax numériquement stable
def softmax(z):
    e = np.exp(z - np.max(z))     # soustraire le max évite exp(1000) = inf
    return e / e.sum()

print(np.round(softmax(np.array([1.0, 2.0, 3.0])), 3))           # [0.09  0.245 0.665]
print(np.round(softmax(np.array([1000.0, 1001.0, 1002.0])), 3))  # [0.09  0.245 0.665]
with np.errstate(over="ignore", invalid="ignore"):
    z = np.array([1000.0, 1001.0, 1002.0])
    print(np.exp(z) / np.exp(z).sum())          # [nan nan nan]  (version naïve)
```

## Descente de gradient stochastique

À chaque pas, on applique $w \leftarrow w - \eta \, \nabla_w \mathcal{L}$, mais le gradient peut être estimé sur plus ou moins d'exemples. Le **lot complet** (batch) donne le gradient exact, au prix d'une seule mise à jour par passage sur les données. La **descente stochastique** (SGD) n'utilise qu'un exemple : les mises à jour sont nombreuses mais très bruitées. Le **mini-lot** (mini-batch), de quelques dizaines à quelques centaines d'exemples, est le compromis utilisé en pratique, et il exploite bien le calcul parallèle des GPU.

Une **époque** est un passage complet sur les données : avec 50 000 exemples et des mini-lots de 250, elle compte 200 mises à jour. Un entraînement dure en général de nombreuses époques.

## Disparition du gradient et régularisation

La rétropropagation multiplie les dérivées des couches successives. Avec la sigmoïde, dont la dérivée ne dépasse pas $0{,}25$, le gradient peut décroître de façon exponentielle avec la profondeur : c'est la **disparition du gradient**, qui fige l'apprentissage des premières couches. ReLU, une initialisation adaptée, la normalisation par lots (batch normalization) et les connexions résiduelles l'atténuent. À l'inverse, des facteurs supérieurs à 1 font **exploser** le gradient.

Contre le surapprentissage, on **régularise** le réseau :

- **dropout** : à chaque pas d'entraînement, chaque neurone est éteint avec une probabilité $p$, souvent $0{,}5$, ce qui l'empêche de dépendre de quelques neurones précis ; il est désactivé à la prédiction ;
- **weight decay** (régularisation L2) : on ajoute $\frac{\lambda}{2} \lVert w \rVert^2$ à la perte, ce qui tire chaque poids vers 0 à chaque pas ;
- **arrêt précoce** (early stopping) : on arrête l'entraînement dès que la perte de validation remonte.

## Réseaux convolutifs (CNN)

Pour une image, une couche dense relierait chaque pixel à chaque neurone. Une **convolution** fait plutôt glisser un petit filtre, par exemple $3 \times 3$, sur toute l'image, et calcule à chaque position une somme pondérée des pixels couverts. Les mêmes poids servent à toutes les positions (**partage des poids**) : 10 filtres $3 \times 3$ sur une image à 1 canal ne coûtent que $10 \times (9 + 1) = 100$ paramètres, quelle que soit la taille de l'image, et un motif est détecté où qu'il se trouve.

Pour une entrée de côté $n$, un noyau de côté $k$, un remplissage (padding) $p$ et un pas (stride) $s$, la sortie a pour côté $(n + 2p - k)/s + 1$. Avec $n = 28$, $k = 3$, $p = 1$ et $s = 1$, la taille est conservée : $(28 + 2 - 3)/1 + 1 = 28$.

Le **pooling** résume ensuite chaque fenêtre par son maximum (max pooling) ou sa moyenne : un max pooling $2 \times 2$ de pas 2 divise la hauteur et la largeur par 2, sans aucun paramètre. En empilant convolutions et poolings, les premières couches détectent des bords, les suivantes des formes de plus en plus abstraites.

## Séquences : RNN et LSTM

Un **réseau récurrent** (RNN) lit une séquence élément par élément et met à jour un état caché qui résume ce qu'il a déjà lu : $h_t = \tanh(W_h h_{t-1} + W_x x_t + b)$, avec les mêmes poids à chaque pas de temps. Mais le gradient doit traverser tous les pas, et il disparaît sur les longues séquences.

Le **LSTM** ajoute une **cellule mémoire** contrôlée par trois portes (oubli, entrée, sortie), des sigmoïdes qui décident quoi effacer, ajouter ou lire. Comme la cellule est mise à jour par addition, l'information et le gradient circulent sur bien plus de pas. Limite commune aux deux : le calcul reste séquentiel, donc difficile à paralléliser.

## Transformers et attention

Un **Transformer** abandonne la récurrence : chaque élément de la séquence consulte directement tous les autres grâce à l'**attention**. Chaque élément produit une requête $q$, une clé $k$ et une valeur $v$, trois projections linéaires apprises ; rangées en lignes dans des matrices $Q$, $K$ et $V$, elles donnent :

$$
\operatorname{Attention}(Q, K, V) = \operatorname{softmax}\left( \frac{Q K^\top}{\sqrt{d}} \right) V
$$

- $QK^\top$ contient les produits scalaires entre chaque requête et chaque clé : des scores de pertinence ;
- la division par $\sqrt{d}$, où $d$ est la dimension des clés, empêche ces scores de grandir avec $d$ et de saturer la softmax ;
- la softmax, appliquée ligne par ligne, donne des poids positifs de somme 1, et la sortie de chaque élément est la moyenne des valeurs pondérée par ces poids.

Tous les éléments sont traités en parallèle, ce qui rend l'entraînement très efficace sur GPU. L'attention ignorant l'ordre, on ajoute à chaque élément un **encodage de position**. Plusieurs têtes d'attention en parallèle (multi-head), suivies de couches denses, forment le bloc de base des grands modèles de langage.

## Panorama des architectures

| Architecture | Type de données | Mécanisme clé | Exemple d'usage |
|---|---|---|---|
| MLP | vecteurs de variables (données tabulaires) | couches denses et activations non linéaires | prédire un prix à partir de caractéristiques |
| CNN | images, grilles | convolution à poids partagés, pooling | reconnaître des objets sur une photo |
| RNN / LSTM | séquences (texte, séries temporelles) | état caché récurrent, portes du LSTM | prévoir une consommation électrique heure par heure |
| Transformer | séquences, surtout du texte | self-attention parallèle, encodage de position | traduction automatique, modèles de langage |

## À retenir

> - Neurone : $a = f(w^\top x + b)$ ; sans activation non linéaire, un réseau profond reste une fonction affine.
> - Classification : softmax en sortie et entropie croisée $-\ln p_c$ ; régression : MSE.
> - Rétropropagation : règle de la chaîne de la sortie vers l'entrée, puis $w \leftarrow w - \eta \, \partial L / \partial w$.
> - Mini-lots : compromis entre gradient exact et gradient bruité ; une époque est un passage complet sur les données.
> - Disparition du gradient : produit de petites dérivées (sigmoïde $\leq 0{,}25$) ; ReLU et connexions résiduelles l'atténuent.
> - Régularisation : dropout, weight decay, arrêt précoce.
> - CNN : filtres à poids partagés, sortie de côté $(n + 2p - k)/s + 1$ ; RNN et LSTM pour les séquences ; Transformer : $\operatorname{softmax}(QK^\top / \sqrt{d}) \, V$.
