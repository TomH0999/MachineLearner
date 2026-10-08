# Développement web, Git et génie logiciel

Une application web repose sur trois langages exécutés par le navigateur (HTML pour la structure, CSS pour la présentation, JavaScript pour le comportement), qui dialoguent avec un serveur par le protocole HTTP. Cette fiche présente ces fondations et leurs pièges de sécurité, puis les pratiques qui permettent de faire évoluer un projet sans le casser : Git, les tests et l'intégration continue.

## HTML sémantique et accessibilité

Le HTML décrit le **sens** du contenu, pas son apparence. Les balises sémantiques (`header`, `nav`, `main`, `article`, `section`, `aside`, `footer`) structurent la page, et une hiérarchie de titres `h1` à `h6` sans saut de niveau lui sert de table des matières. Les lecteurs d'écran, la navigation au clavier et les moteurs de recherche s'appuient sur cette structure. Règles d'accessibilité de base :

- un vrai `<button>` pour une action et un lien `<a href>` pour une navigation : ils reçoivent le focus, s'activent au clavier et sont annoncés correctement par les lecteurs d'écran, contrairement à une `<div>` rendue cliquable ;
- un attribut `alt` sur chaque image : une description si elle informe, `alt=""` si elle est décorative ;
- un `<label>` associé à chaque champ de formulaire, par ses attributs `for` et `id` ;
- un contraste suffisant et un focus visible. Les attributs ARIA ne servent qu'en dernier recours, quand aucun élément natif ne convient.

## CSS : modèle de boîte, flexbox et grid

Chaque élément est une **boîte** : le contenu, puis la marge intérieure (`padding`), la bordure (`border`) et la marge extérieure (`margin`). Avec `box-sizing: content-box`, la valeur par défaut, `width` ne mesure que le contenu : une boîte `width: 200px; padding: 10px; border: 2px solid` occupe 200 + 2 × 10 + 2 × 2 = 224 px de large, marges non comprises. Avec `box-sizing: border-box`, `width` inclut le padding et la bordure : la boîte fait 200 px, ce qui simplifie les calculs, et beaucoup de projets l'appliquent à tous les éléments.

Pour la mise en page, **flexbox** répartit des éléments le long d'**un axe**, une ligne ou une colonne : barre de navigation, boutons alignés, centrage. **Grid** place les éléments sur **deux axes** à la fois, lignes et colonnes : structure de page, galerie, tableau de bord. Les deux se combinent souvent : une grille pour la page, flexbox à l'intérieur de chaque carte.

## Spécificité CSS

Quand plusieurs règles ciblent le même élément, le navigateur applique celle dont la **spécificité** est la plus forte. Elle se compte comme un triplet (a, b, c) : a est le nombre d'identifiants (`#nav`), b celui des classes, attributs et pseudo-classes (`.item`, `[type="text"]`, `:hover`), c celui des éléments et pseudo-éléments (`a`, `::before`). On compare a d'abord, puis b, puis c seulement en cas d'égalité ; à spécificité égale, la dernière règle déclarée gagne. Un style en ligne (`style="…"`) passe avant les feuilles de style, et une déclaration `!important` passe avant les déclarations normales.

```css
/* (1, 1, 1) : un identifiant (#nav), une classe (.item), un élément (a) */
#nav .item a { color: navy; }

/* (0, 3, 1) : deux classes et une pseudo-classe (.menu, .item, :hover), un élément (a) */
.menu .item a:hover { color: crimson; }

/* Pour colorer le survol malgré la première règle : (1, 2, 1) */
#nav .item a:hover { color: crimson; }
```

Pour un lien placé dans un `<li class="item">` de `<nav id="nav" class="menu">`, la première règle l'emporte sur la deuxième, **même au survol** : (1, 1, 1) > (0, 3, 1) dès la première composante, car un seul identifiant pèse plus que n'importe quel nombre de classes. Pour changer la couleur au survol, il faut un sélecteur au moins aussi spécifique, comme la troisième règle.

## JavaScript : égalité, portée et closures

`===` (égalité stricte) compare le type et la valeur, sans conversion. `==` convertit d'abord les opérandes vers un type commun, selon des règles peu intuitives : `0 == ""` est vrai, car la chaîne vide devient le nombre 0. On utilise donc toujours `===`, sauf dans l'idiome `x == null`, vrai pour `null` comme pour `undefined`.

`var` a une **portée de fonction** ; `let` et `const` ont une **portée de bloc** (`{ … }`), et `const` interdit la réaffectation de la variable, pas la modification de l'objet qu'elle désigne. Une **closure** est une fonction qui garde l'accès aux variables de la portée où elle a été créée, même après la fin de la fonction englobante : c'est ainsi qu'on crée un état privé.

```js
// Closure : chaque compteur garde son propre « total », inaccessible de l'extérieur
function creerCompteur() {
  let total = 0;
  return () => ++total;
}
const compteurA = creerCompteur();
const compteurB = creerCompteur();
console.log(compteurA(), compteurA(), compteurB()); // 1 2 1

// == convertit les types avant de comparer, === exige le même type et la même valeur
console.log(0 == "", 0 === "");                     // true false
console.log("5" == 5, "5" === 5);                   // true false
console.log(null == undefined, null === undefined); // true false
console.log(null == 0, NaN == NaN);                 // false false

// var : un seul i pour toute la boucle, qui vaut 3 quand les callbacks s'exécutent.
// let : une nouvelle variable j à chaque tour. Ces lignes s'affichent en dernier (setTimeout).
for (var i = 0; i < 3; i++) setTimeout(() => console.log("var", i), 0); // var 3, trois fois
for (let j = 0; j < 3; j++) setTimeout(() => console.log("let", j), 0); // let 0, let 1, let 2
```

## Boucle d'événements, promesses et async/await

JavaScript exécute le code d'une page sur **un seul fil**, avec une pile d'appels et une **boucle d'événements**. Quand la pile est vide, la boucle exécute **toutes les microtâches** en attente (callbacks de promesses `then`, suites de fonctions après `await`, `queueMicrotask`), puis **une macrotâche** (callback de `setTimeout`, événement clic, message réseau), puis recommence.

```js
console.log("A");                               // code synchrone : affiché en 1er
setTimeout(() => console.log("B"), 0);          // macrotâche : affiché en 4e
Promise.resolve().then(() => console.log("C")); // microtâche : affiché en 3e
console.log("D");                               // code synchrone : affiché en 2e
// Sortie : A, D, C, B (une lettre par ligne)
```

A et D s'affichent pendant l'exécution du script. Une fois la pile vide, la file des microtâches est vidée (C), et seulement ensuite la boucle passe à la macrotâche du minuteur (B), malgré son délai de 0 ms. Une **promesse** représente un résultat futur : en attente, puis tenue (`resolve`) ou rompue (`reject`). `async`/`await` en est l'écriture lisible : `await` suspend la fonction `async` jusqu'au règlement de la promesse, sans bloquer la boucle d'événements, et les erreurs se rattrapent avec `try`/`catch`. Pour des requêtes indépendantes, `await Promise.all([…])` les lance en parallèle au lieu de les attendre l'une après l'autre.

## HTTP et API REST

HTTP est un protocole **requête-réponse** : le client envoie une méthode, une URL, des en-têtes et parfois un corps ; le serveur répond par un **code d'état**, des en-têtes et un corps. Une méthode est **sûre** si elle ne modifie pas l'état du serveur, et **idempotente** si l'exécuter plusieurs fois laisse le serveur dans le même état qu'une seule fois : on peut alors la rejouer sans risque après une coupure réseau.

| Méthode | Usage | Idempotente | Sûre |
|---|---|---|---|
| GET | lire une ressource | oui | oui |
| HEAD | comme GET, sans le corps de la réponse | oui | oui |
| OPTIONS | connaître les options de communication, dont la requête de prévol CORS | oui | oui |
| POST | créer une ressource ou déclencher un traitement | non | non |
| PUT | remplacer entièrement une ressource | oui | non |
| PATCH | modifier une partie d'une ressource | non garanti | non |
| DELETE | supprimer une ressource | oui | non |

| Code | Signification | Exemple |
|---|---|---|
| 200 OK | succès, avec un corps | `GET /notes/42` renvoie la note |
| 201 Created | ressource créée, souvent avec son URL dans l'en-tête `Location` | après `POST /notes` |
| 204 No Content | succès, sans corps | après `DELETE /notes/42` |
| 301 Moved Permanently | la ressource a une nouvelle URL définitive | ancienne adresse d'une page déplacée |
| 304 Not Modified | la copie en cache reste valable, aucun corps n'est renvoyé | requête avec `If-None-Match` |
| 400 Bad Request | requête mal formée ou invalide | JSON illisible, champ obligatoire manquant |
| 401 Unauthorized | authentification absente ou invalide | jeton expiré |
| 403 Forbidden | client identifié, mais sans le droit d'accès | un étudiant sur une page d'administration |
| 404 Not Found | ressource inexistante | `GET /notes/9999` |
| 500 Internal Server Error | erreur imprévue côté serveur | exception non rattrapée |

Une API **REST** expose des **ressources** identifiées par des URL (`/notes`, `/notes/42`), manipulées avec les méthodes HTTP plutôt qu'avec des verbes dans l'URL : `POST /notes`, pas `/creerNote`. Elle est **sans état** : chaque requête contient tout ce qu'il faut pour être traitée, y compris l'authentification, et le serveur ne garde aucun contexte de conversation entre deux requêtes, ce qui permet de répartir la charge sur plusieurs serveurs.

## Cookies, sessions et CORS

HTTP étant sans état, le serveur reconnaît un utilisateur connecté grâce à un **cookie** : après la connexion, il crée une **session** et envoie son identifiant dans l'en-tête `Set-Cookie`, puis le navigateur renvoie ce cookie automatiquement à chaque requête vers le site. Trois attributs le protègent : `HttpOnly` (illisible en JavaScript, donc hors de portée d'un script injecté), `Secure` (envoyé seulement en HTTPS) et `SameSite` (avec `Strict`, jamais joint aux requêtes venues d'un autre site ; avec `Lax`, seulement lors d'une navigation GET vers le site).

La **politique de même origine** empêche une page de lire les réponses d'une autre **origine** (même schéma, même hôte, même port). **CORS** permet au serveur visé d'assouplir cette règle : sa réponse contient `Access-Control-Allow-Origin` avec l'origine qu'il autorise. Pour les requêtes « non simples » (méthode PUT ou DELETE, corps `application/json`…), le navigateur envoie d'abord une requête de **prévol** `OPTIONS`. CORS est appliqué par le navigateur : il ne protège pas le serveur d'un script ou d'un client en ligne de commande, qui ignorent ces en-têtes.

## Sécurité : XSS et CSRF

Une faille **XSS** (cross-site scripting) survient quand une donnée fournie par un utilisateur est insérée dans la page sans être échappée : un commentaire contenant `<script>` s'exécute alors chez chaque visiteur, avec ses droits, et peut lire la page ou agir en son nom. Parade principale : **échapper** les données à l'affichage (`<` devient `&lt;`), ce que React fait par défaut pour le texte ; en complément, des cookies `HttpOnly` et un en-tête `Content-Security-Policy` qui restreint les scripts autorisés.

Une attaque **CSRF** (cross-site request forgery) exploite le fait que le navigateur joint les cookies automatiquement : une page piégée soumet un formulaire vers le site d'une banque, et la requête part avec le cookie de session de la victime. Parades : `SameSite` sur le cookie de session, un **jeton anti-CSRF** que la page piégée ne peut pas connaître, et la **vérification de l'en-tête `Origin`**. Le navigateur remplit lui-même cet en-tête avec l'origine de la page qui émet la requête, et un script ne peut pas le modifier : si l'origine n'est pas celle du site, le serveur refuse la requête. Enfin, une requête GET ne doit jamais modifier de données.

## Git : branches, merge et rebase

Un **commit** est un instantané du projet, identifié par un hachage et relié à son ou ses parents ; une **branche** n'est qu'un pointeur mobile vers un commit. On développe chaque fonctionnalité sur sa propre branche, puis on l'intègre à `main` :

- **merge** relie les deux historiques par un commit de fusion (sauf en avance rapide, quand la branche cible n'a pas bougé), sans modifier les commits existants : l'historique est fidèle mais ramifié ;
- **rebase** rejoue les commits de la branche par-dessus la dernière version de `main` : l'historique devient linéaire, mais les commits sont recréés avec de nouveaux hachages. On ne rebase donc pas une branche déjà partagée, sauf à forcer l'envoi avec `git push --force-with-lease` en connaissance de cause.

Un **conflit** survient quand les deux côtés modifient les mêmes lignes : Git s'arrête et encadre les deux versions par des marqueurs `<<<<<<<`, `=======` et `>>>>>>>`. On édite le fichier pour garder la bonne version, on le marque comme résolu avec `git add`, puis on termine la fusion (`git commit`) ou le rebase (`git rebase --continue`). Une **pull request** (merge request sur GitLab) propose de fusionner une branche : elle permet la relecture du code et le passage des tests automatiques avant l'intégration.

```bash
# 1. Partir de main à jour et créer une branche de fonctionnalité
git switch main
git pull
git switch -c feature/quiz
# 2. Travailler, puis enregistrer un commit
git add src/quiz.ts
git commit -m "feat: quiz avec correction côté serveur"
# 3. Rejouer ses commits par-dessus la dernière version de main
git fetch origin
git rebase origin/main
# 4. En cas de conflit : éditer le fichier (zones <<<<<<< ======= >>>>>>>), le marquer résolu, continuer
git status
git add src/quiz.ts
git rebase --continue
# 5. Publier la branche pour ouvrir une pull request, ou fusionner localement
git push -u origin feature/quiz
git switch main
git merge --no-ff feature/quiz
```

## Tests et intégration continue

- Un **test unitaire** vérifie une fonction isolée, sans base de données ni réseau : rapide et précis, il désigne directement la fonction fautive.
- Un **test d'intégration** vérifie que plusieurs composants fonctionnent ensemble, par exemple une route d'API et sa base de données : plus lent, mais plus proche du fonctionnement réel.
- Le **TDD** (développement piloté par les tests) enchaîne trois temps : écrire un test qui échoue (rouge), écrire le code minimal qui le fait passer (vert), puis remanier le code en gardant les tests verts (refactor).

L'**intégration continue** (CI) exécute automatiquement, à chaque push ou pull request, l'installation du projet, le lint, les tests et le build : une régression est détectée avant la fusion. La **livraison continue** ou le **déploiement continu** (CD) prolonge la chaîne : chaque version qui passe ces étapes est prête à partir en production, ou y part automatiquement.

## Exemple concret : EngiPath

EngiPath est développé avec ces méthodes :

- **un commit par étape** : chaque étape du plan (schéma de données, logique de l'arbre, quiz, flashcards…) est vérifiée par le contrôle des types et les tests, puis enregistrée dans un commit. En cas d'erreur, on revient au dernier état sain sans rien perdre ;
- **des tests unitaires sur la logique pure** : le calcul des statuts de l'arbre (verrouillé, débloqué, terminé), l'algorithme de répétition espacée SM-2, la correction des quiz et la validation des banques de questions sont des fonctions sans base de données ni réseau, dont les tests s'exécutent en moins d'une seconde avant chaque commit ;
- **la vérification de l'en-tête Origin contre le CSRF** : la connexion repose sur un cookie de session, que le navigateur joindrait aussi à une requête forgée par un autre site. Les modifications de données passent par des Server Actions de Next.js, appelées par des requêtes POST, et Next.js compare l'en-tête `Origin` à l'hôte du site avant de les exécuter ; la bibliothèque d'authentification vérifie elle aussi l'origine des requêtes qu'elle reçoit.

## À retenir

> - HTML sémantique et éléments natifs (`button`, `a`, `label`, `alt`) : la base de l'accessibilité.
> - Modèle de boîte : en `content-box`, padding et bordure s'ajoutent à `width`. Flexbox pour un axe, Grid pour deux.
> - Spécificité (identifiants, classes, éléments) comparée de gauche à droite : `#nav .item a` (1, 1, 1) bat `.menu .item a:hover` (0, 3, 1).
> - Toujours `===` ; une closure garde l'accès aux variables de sa portée de création ; microtâches (promesses) avant macrotâches (`setTimeout`) : A, D, C, B.
> - GET, PUT et DELETE sont idempotents, POST ne l'est pas ; 401 = non authentifié, 403 = authentifié sans droit ; REST = ressources + méthodes HTTP, sans état.
> - XSS : échapper les données affichées ; CSRF : `SameSite`, jeton et vérification de l'en-tête `Origin` ; CORS est un assouplissement contrôlé par le serveur et appliqué par le navigateur.
> - Git : une branche par fonctionnalité, merge conserve l'historique, rebase le réécrit ; les tests unitaires et la CI détectent les régressions avant la fusion.
