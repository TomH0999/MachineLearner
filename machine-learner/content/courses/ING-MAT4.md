# Probabilités avancées et statistiques inférentielles

Les probabilités décrivent l'incertitude d'un phénomène aléatoire, et les statistiques inférentielles font le chemin inverse en tirant d'un échantillon des conclusions chiffrées sur toute une population. Ces deux faces sont omniprésentes en IA, de la classification bayésienne à l'évaluation rigoureuse d'un modèle.

## Variables aléatoires

Une **variable aléatoire** $X$ associe un nombre au résultat d'une expérience aléatoire.

- **Discrète** : $X$ prend des valeurs isolées $x_1, x_2, \dots$ avec des probabilités $p_k = P(X = x_k)$ de somme 1 (nombre de clics, résultat d'un dé).
- **Continue** : $X$ a une **densité** $f \geq 0$ d'intégrale 1, et $P(a \leq X \leq b) = \int_a^b f(x) \, dx$. Une valeur précise a une probabilité nulle : $P(X = a) = 0$.

L'**espérance** est la moyenne des valeurs pondérée par leurs probabilités, et la **variance** mesure la dispersion autour d'elle :

$$
E(X) = \sum_k x_k \, p_k \quad \text{ou} \quad E(X) = \int_{-\infty}^{+\infty} x \, f(x) \, dx, \qquad \operatorname{Var}(X) = E\big[(X - E(X))^2\big] = E(X^2) - E(X)^2
$$

L'**écart-type** $\sigma = \sqrt{\operatorname{Var}(X)}$ s'exprime dans la même unité que $X$.

## Lois usuelles

| Loi | Situation type | Espérance | Variance |
|---|---|---|---|
| Bernoulli $\mathcal{B}(p)$ | succès (1) ou échec (0) | $p$ | $p(1 - p)$ |
| Binomiale $\mathcal{B}(n, p)$ | nombre de succès sur $n$ essais indépendants | $np$ | $np(1 - p)$ |
| Poisson $\mathcal{P}(\lambda)$ | nombre d'événements rares sur une période | $\lambda$ | $\lambda$ |
| Uniforme $\mathcal{U}([a, b])$ | valeur prise au hasard dans un intervalle | $\frac{a + b}{2}$ | $\frac{(b - a)^2}{12}$ |
| Normale $\mathcal{N}(\mu, \sigma^2)$ | erreurs de mesure, somme de nombreux petits effets | $\mu$ | $\sigma^2$ |
| Exponentielle $\mathcal{E}(\lambda)$ | durée d'attente sans mémoire | $\frac{1}{\lambda}$ | $\frac{1}{\lambda^2}$ |

Formules utiles : $P(X = k) = \binom{n}{k} p^k (1 - p)^{n - k}$ pour la binomiale, $P(X = k) = e^{-\lambda} \frac{\lambda^k}{k!}$ pour la loi de Poisson, et la densité $f(x) = \lambda e^{-\lambda x}$ sur $[0, +\infty[$ pour l'exponentielle. Pour une loi normale, environ 68 %, 95 % et 99,7 % des valeurs tombent à moins de 1, 2 et 3 écarts-types de $\mu$.

## Linéarité de l'espérance et variance

Pour toutes variables $X$ et $Y$ et toutes constantes $a$ et $b$ :

- $E(aX + bY) = a \, E(X) + b \, E(Y)$, **même en cas de dépendance** ;
- $\operatorname{Var}(aX + b) = a^2 \operatorname{Var}(X)$ : ajouter une constante décale la loi sans la disperser ;
- si $X$ et $Y$ sont **indépendantes**, $\operatorname{Var}(X + Y) = \operatorname{Var}(X - Y) = \operatorname{Var}(X) + \operatorname{Var}(Y)$.

Exemple : une binomiale $\mathcal{B}(n, p)$ est la somme de $n$ variables de Bernoulli indépendantes de paramètre $p$, d'où $E = np$ et $\operatorname{Var} = np(1 - p)$ sans aucun calcul de somme.

## Théorème de Bayes

$$
P(A \mid B) = \frac{P(B \mid A) \, P(A)}{P(B)}, \qquad P(B) = P(B \mid A) \, P(A) + P(B \mid \bar{A}) \, P(\bar{A})
$$

$P(A)$ est la probabilité **a priori** ; $P(A \mid B)$ est la probabilité **a posteriori**, mise à jour après avoir observé $B$.

**Exemple : le test médical.** Une maladie touche 1 % de la population. Le test détecte 99 % des malades (sensibilité) et donne un résultat négatif pour 95 % des personnes saines (spécificité). Une personne est testée positive : quelle est la probabilité qu'elle soit malade ?

- Données : $P(M) = 0{,}01$, $P(+ \mid M) = 0{,}99$ et $P(+ \mid \bar{M}) = 1 - 0{,}95 = 0{,}05$.
- Probabilité d'un test positif : $P(+) = 0{,}99 \times 0{,}01 + 0{,}05 \times 0{,}99 = 0{,}0099 + 0{,}0495 = 0{,}0594$.
- Bayes : $P(M \mid +) = \dfrac{0{,}0099}{0{,}0594} \approx 0{,}167$, soit environ **16,7 %**.

Le résultat surprend, mais il s'explique par la **rareté** de la maladie. Sur 10 000 personnes, 100 sont malades et 99 d'entre elles sont détectées ; parmi les 9 900 personnes saines, 5 %, soit 495, sont des faux positifs. Sur 594 tests positifs, seuls 99 correspondent à des malades : $99 / 594 = 1/6$. Pour une maladie rare, un test positif doit donc être confirmé par un second examen.

## Loi des grands nombres et théorème central limite

Soient $X_1, \dots, X_n$ des variables indépendantes de même loi, d'espérance $\mu$ et d'écart-type $\sigma$, et $\bar{X}_n = \frac{1}{n} \sum_{i=1}^{n} X_i$ leur moyenne. On a $E(\bar{X}_n) = \mu$ et $\operatorname{Var}(\bar{X}_n) = \sigma^2 / n$.

- **Loi des grands nombres** : $\bar{X}_n$ converge vers $\mu$ quand $n \to \infty$. C'est ce qui justifie d'estimer une probabilité par une fréquence observée.
- **Théorème central limite (TCL)** : quelle que soit la loi des $X_i$ (de variance finie), l'écart standardisé tend vers une loi normale centrée réduite :

$$
\frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}} \xrightarrow[n \to \infty]{\text{loi}} \mathcal{N}(0, 1)
$$

Autrement dit, pour $n$ grand (en pratique $n \geq 30$), $\bar{X}_n$ suit approximativement la loi $\mathcal{N}(\mu, \sigma^2 / n)$. La simulation suivante le vérifie avec une loi exponentielle de paramètre 1, très dissymétrique, pour laquelle $\mu = \sigma = 1$ : la théorie prévoit des moyennes centrées en 1, d'écart-type $1 / \sqrt{50} \approx 0{,}141$.

```python
import numpy as np

rng = np.random.default_rng(42)
n, repetitions = 50, 10_000

# 10 000 échantillons de 50 tirages d'une loi exponentielle de paramètre 1
tirages = rng.exponential(scale=1.0, size=(repetitions, n))
moyennes = tirages.mean(axis=1)    # une moyenne par échantillon

print(round(moyennes.mean(), 4))   # 0.9981  (théorie : mu = 1)
print(round(moyennes.std(), 4))    # 0.1402  (théorie : 1 / racine(50) ≈ 0.1414)
```

## Estimation et intervalle de confiance

Un **estimateur** $T$ d'un paramètre $\theta$ est une fonction de l'échantillon ; il est **sans biais** si $E(T) = \theta$.

- La moyenne empirique $\bar{X}_n$ est un estimateur sans biais de $\mu$.
- La variance corrigée $S^2 = \frac{1}{n - 1} \sum_{i=1}^{n} (X_i - \bar{X}_n)^2$ est sans biais pour $\sigma^2$. Diviser par $n$ sous-estime la variance en moyenne, car les écarts sont mesurés par rapport à $\bar{X}_n$ et non à $\mu$ ; en NumPy, c'est la différence entre `np.var(x)` et `np.var(x, ddof=1)`.

Le TCL fournit un **intervalle de confiance à 95 %** pour $\mu$, quand $\sigma$ est connu et $n$ assez grand :

$$
\left[ \bar{x} - 1{,}96 \, \frac{\sigma}{\sqrt{n}} \; ; \; \bar{x} + 1{,}96 \, \frac{\sigma}{\sqrt{n}} \right]
$$

La valeur 1,96 vérifie $P(-1{,}96 \leq Z \leq 1{,}96) \approx 0{,}95$ pour $Z$ de loi $\mathcal{N}(0, 1)$. Interprétation : la méthode produit un intervalle qui contient la vraie valeur $\mu$ dans 95 % des échantillons. Si $\sigma$ est inconnu, on le remplace par $S$ et, pour un petit échantillon, 1,96 par un quantile de la loi de Student.

Exemple : 400 mesures du temps de réponse d'une API donnent $\bar{x} = 120$ ms, avec $\sigma = 30$ ms. L'intervalle vaut $120 \pm 1{,}96 \times 30 / 20 = 120 \pm 2{,}94$ ms, soit $[117{,}06 \; ; \; 122{,}94]$. Pour diviser sa largeur par 2, il faut 4 fois plus de mesures.

## Tests d'hypothèse

Un test confronte une **hypothèse nulle** $H_0$ (« pas d'effet », « la pièce est conforme ») à une hypothèse alternative $H_1$, à partir des données.

1. On fixe un **seuil** $\alpha$, souvent 5 %.
2. On calcule la **p-value** : la probabilité, si $H_0$ est vraie, d'observer un résultat au moins aussi extrême que celui obtenu.
3. Si la p-value est inférieure à $\alpha$, on rejette $H_0$ ; sinon, on ne la rejette pas, ce qui ne prouve pas qu'elle est vraie.

La p-value n'est **pas** la probabilité que $H_0$ soit vraie. Deux erreurs sont possibles :

| Décision | $H_0$ vraie | $H_0$ fausse |
|---|---|---|
| Rejeter $H_0$ | erreur de type I (probabilité $\alpha$) | bonne décision (puissance $1 - \beta$) |
| Ne pas rejeter $H_0$ | bonne décision | erreur de type II (probabilité $\beta$) |

À taille d'échantillon fixée, diminuer $\alpha$ réduit les faux positifs mais augmente $\beta$ ; seul un échantillon plus grand réduit les deux à la fois.

## Chaînes de Markov

Une **chaîne de Markov** est une suite d'états aléatoires $X_0, X_1, \dots$ dans laquelle l'état suivant ne dépend que de l'état présent. Elle est décrite par sa **matrice de transition** $P$, où $P_{ij}$ est la probabilité de passer de l'état $i$ à l'état $j$ ; chaque ligne a une somme égale à 1. Si la loi de $X_t$ est le vecteur ligne $\mu_t$, alors $\mu_{t+1} = \mu_t P$.

Une **distribution stationnaire** $\pi$ vérifie $\pi P = \pi$ et $\sum_i \pi_i = 1$. Pour une chaîne finie, irréductible et apériodique, la loi de $X_t$ converge vers $\pi$ quel que soit l'état de départ.

**Exemple.** Un modèle météo à deux états, beau temps (1) et pluie (2) :

$$
P = \begin{pmatrix} 0{,}9 & 0{,}1 \\ 0{,}5 & 0{,}5 \end{pmatrix}
$$

On cherche $\pi = (\pi_1, \pi_2)$ tel que $\pi P = \pi$ :

- première composante : $0{,}9 \, \pi_1 + 0{,}5 \, \pi_2 = \pi_1$, soit $0{,}5 \, \pi_2 = 0{,}1 \, \pi_1$, donc $\pi_1 = 5 \, \pi_2$ ;
- normalisation : $\pi_1 + \pi_2 = 6 \, \pi_2 = 1$, donc $\pi_2 = \frac{1}{6}$ et $\pi_1 = \frac{5}{6}$.

Vérification sur la seconde composante : $0{,}1 \times \frac{5}{6} + 0{,}5 \times \frac{1}{6} = \frac{0{,}5 + 0{,}5}{6} = \frac{1}{6}$. À long terme, il fait beau 5 jours sur 6, quel que soit le temps du premier jour ; numériquement, les deux lignes de $P^{20}$ valent déjà environ $(0{,}8333 \; ; \; 0{,}1667)$. L'algorithme PageRank classe les pages web selon la distribution stationnaire d'une chaîne de Markov construite sur les liens.

## À retenir

> - Discrète : les $P(X = k)$ ; continue : une densité, et $P(X = a) = 0$. Dans les deux cas, $\operatorname{Var}(X) = E(X^2) - E(X)^2$.
> - L'espérance est toujours linéaire ; $\operatorname{Var}(aX + b) = a^2 \operatorname{Var}(X)$, et les variances de variables indépendantes s'ajoutent.
> - Bayes : $P(A \mid B) = P(B \mid A) \, P(A) / P(B)$ ; pour une maladie rare, un test positif reste souvent un faux positif.
> - LGN : $\bar{X}_n \to \mu$ ; TCL : $\bar{X}_n$ suit approximativement $\mathcal{N}(\mu, \sigma^2 / n)$ pour $n$ grand, quelle que soit la loi de départ.
> - Intervalle de confiance à 95 % : $\bar{x} \pm 1{,}96 \, \sigma / \sqrt{n}$ ; sa largeur diminue en $1 / \sqrt{n}$.
> - Test : rejeter $H_0$ si p-value $< \alpha$ ; type I = rejeter $H_0$ à tort ($\alpha$), type II = conserver $H_0$ à tort ($\beta$).
> - Markov : $\pi P = \pi$ et $\sum_i \pi_i = 1$ ; pour l'exemple météo, $\pi = (5/6, 1/6)$.
