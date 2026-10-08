# Anglais professionnel et technique : TOEIC, grammaire et documentation

Un ingénieur lit chaque jour de la documentation, des messages d'erreur et des tickets rédigés en anglais, et le diplôme d'ingénieur exige un niveau B2 attesté par une certification externe, souvent le TOEIC. Cette fiche présente le format du TOEIC Listening & Reading, le vocabulaire technique et les faux amis courants, les points de grammaire les plus testés, puis la manière de lire une spécification et d'écrire un commit ou une issue en anglais.

## Le TOEIC Listening & Reading

Le test compte 200 questions à choix multiple, en deux sections notées chacune de 5 à 495 points : le score total va de **10 à 990**. Les enregistrements ne sont diffusés qu'une fois, et une mauvaise réponse ne retire aucun point. Selon les correspondances publiées par ETS, l'organisme qui conçoit le test, le niveau B2 commence à 785 points.

| Section | Partie | Contenu | Questions |
|---|---|---|---|
| Listening (45 min, 100 questions) | Part 1 : Photographs | choisir, parmi 4 phrases entendues, celle qui décrit la photo | 6 |
| | Part 2 : Question-Response | une question ou une affirmation, puis 3 réponses entendues | 25 |
| | Part 3 : Conversations | dialogues à 2 ou 3 personnes, 3 questions chacun | 39 |
| | Part 4 : Talks | annonces et messages d'un seul locuteur, 3 questions chacun | 30 |
| Reading (75 min, 100 questions) | Part 5 : Incomplete Sentences | phrases à compléter : grammaire et vocabulaire | 30 |
| | Part 6 : Text Completion | textes courts à trous, dont une phrase entière à insérer par texte | 16 |
| | Part 7 : Reading Comprehension | documents seuls (29 questions), puis doubles ou triples (25 questions) | 54 |

## Vocabulaire technique

| Terme | Traduction | Exemple |
|---|---|---|
| to deploy | déployer, mettre en production | *We deploy to production every Tuesday.* |
| release | version publiée ; publier une version | *The 2.1 release fixes three security issues.* |
| rollback | retour à la version précédente (verbe : to roll back) | *The rollback took less than five minutes.* |
| to deprecate | déprécier, déclarer obsolète | *We deprecated the v1 API last year.* |
| throughput | débit : volume traité par unité de temps | *The new queue doubled our throughput to 2,000 messages per second.* |
| latency | latence : délai de réponse d'une opération | *Median latency dropped from 120 ms to 40 ms.* |
| bottleneck | goulot d'étranglement | *Disk I/O is the main bottleneck.* |
| edge case | cas limite | *An empty list is an edge case that the function must handle.* |
| legacy code | code hérité, ancien mais toujours en service | *The billing system still runs on legacy code.* |
| breaking change | changement incompatible | *Removing this endpoint is a breaking change.* |
| backward compatible | rétrocompatible | *The new file format is backward compatible.* |
| workaround | solution de contournement | *As a workaround, restart the service after each update.* |
| hotfix | correctif urgent | *We shipped a hotfix for the login bug.* |
| flaky test | test instable, qui échoue de façon aléatoire | *This flaky test fails about once in twenty runs.* |
| to roll out | déployer progressivement | *The feature is rolled out to 10% of users first.* |
| to troubleshoot | diagnostiquer et résoudre un problème | *The guide explains how to troubleshoot connection errors.* |

## Faux amis

| Anglais | Sens réel | Piège français |
|---|---|---|
| actually | en fait, en réalité | « actuellement » se dit *currently* |
| eventually | finalement, à terme | « éventuellement » se dit *possibly* |
| actual | réel, effectif (*expected vs actual result*) | « actuel » se dit *current* |
| library | bibliothèque, y compris logicielle | « librairie » se dit *bookshop* ou *bookstore* |
| to assist | aider | « assister à » se dit *to attend* |
| sensible | raisonnable, judicieux | « sensible » se dit *sensitive* (*sensitive data*) |
| to resume | reprendre après une interruption | « résumer » se dit *to summarize* |
| to realize | se rendre compte (sens le plus courant) | « réaliser un projet » se dit *to carry out a project* |

## Present perfect ou prétérit

- Le **prétérit** décrit une action terminée, située à un moment passé identifié : *yesterday*, *last week*, *in 2024*, *two days ago*. Exemple : *We deployed the fix two days ago.*
- Le **present perfect** (have + participe passé) relie le passé au présent : un résultat visible maintenant (*We have fixed the bug*), ou une durée qui continue (*The service has been down for two hours*).
- **since** introduit un point de départ (*since Monday*, *since 2024*), **for** une durée (*for three hours*), et **ago** se construit avec le prétérit (*three days ago*).
- Piège pour un francophone : « depuis » + présent devient un present perfect. On écrit *We have used Kubernetes for two years*, jamais *We use Kubernetes since two years*. Pour une activité en cours, la forme continue have been + -ing : *We have been monitoring the cluster since Monday.*

## Voix passive

La voix passive se forme avec **be + participe passé**, et c'est be qui porte le temps ; l'auteur de l'action, s'il est utile, est introduit par *by*. Les documentations et les changelogs l'emploient beaucoup, car l'action compte plus que son auteur :

- présent : *Requests are cached for 60 seconds.*
- prétérit : *The vulnerability was reported by a user last week.*
- present perfect : *The endpoint has been removed.*
- futur : *The v1 API will be shut down in June.*
- forme progressive : *The database is being migrated.*
- après un modal : *This method must be called before the first request.*

## Conditionnels

| Type | Structure | Emploi | Exemple |
|---|---|---|---|
| 0 | if + présent, présent | vérité générale | *If the cache is full, the oldest entry is evicted.* |
| 1 | if + présent, will + base verbale | condition possible | *If the tests pass, the pipeline will deploy the app.* |
| 2 | if + prétérit, would + base verbale | hypothèse sur le présent | *If we had more servers, latency would drop.* |
| 3 | if + past perfect, would have + participe passé | passé qui ne s'est pas produit | *If we had monitored the disk, we would have avoided the outage.* |

Jamais de *will* ni de *would* dans la proposition introduite par *if*. Au type 2, on écrit *were* à toutes les personnes dans un registre soigné (*If I were you, I would roll back*). **unless** signifie « à moins que » : *Unless the build passes, nothing is deployed.*

## Formes des mots

La Part 5 du TOEIC propose souvent quatre formes d'un même mot : la place dans la phrase désigne la bonne. Après un déterminant (*the*, *our*) ou un adjectif, il faut un **nom** ; devant un nom ou après *be*, *become*, *seem*, un **adjectif** ; pour modifier un verbe, un adjectif ou toute la phrase, un **adverbe**, le plus souvent en -ly (*runs efficiently*, *highly efficient*). Suffixes typiques : noms en -tion, -ment, -ity, -ence, -ness ; adjectifs en -able, -ive, -ful, -ous, -al, -ent ; verbes en -ize, -ify.

| Verbe | Nom | Adjectif | Adverbe |
|---|---|---|---|
| — | efficiency | efficient | efficiently |
| to rely | reliability | reliable | reliably |
| to secure | security | secure | securely |
| to succeed | success | successful | successfully |
| to automate | automation | automatic | automatically |

## Prépositions de temps, pronoms relatifs et phrasal verbs

- **at** + heure ou moment précis (*at 2 a.m.*, *at noon*) ; **on** + jour ou date (*on Monday*, *on May 4*) ; **in** + mois, année ou partie de la journée (*in May*, *in 2026*, *in the morning*), et délai à venir (*in two weeks*, dans deux semaines).
- **who** remplace une personne, **which** une chose, **that** l'une ou l'autre, mais seulement sans virgules ; **whose** exprime la possession : *the developer whose commit broke the build*.
- Phrasal verbs du métier : **set up** (installer, configurer), **roll out** (déployer progressivement), **roll back** (revenir à la version précédente), **look into** (examiner, enquêter sur), **figure out** (comprendre, trouver), **shut down** (arrêter). Les noms correspondants s'écrivent en un seul mot : *a setup*, *a rollout*, *a rollback*, *a shutdown*.

## Lire une documentation

Les spécifications, dont les RFC de l'IETF, emploient les mots-clés définis par la **RFC 2119** ; la RFC 8174 précise qu'ils n'ont ce sens qu'écrits en majuscules.

| Mot-clé | Équivalents | Sens |
|---|---|---|
| MUST | REQUIRED, SHALL | exigence absolue |
| MUST NOT | SHALL NOT | interdiction absolue |
| SHOULD | RECOMMENDED | recommandé : on peut s'en écarter pour une raison valable, après en avoir pesé les conséquences |
| SHOULD NOT | NOT RECOMMENDED | déconseillé, avec la même nuance |
| MAY | OPTIONAL | réellement facultatif |

Une fonctionnalité **deprecated** fonctionne encore, mais elle est déconseillée et disparaîtra dans une version future ; la documentation indique en général la solution de remplacement (*Use getUserById() instead*). Elle devient **removed** quand elle est effectivement supprimée. Un **breaking change** oblige les utilisateurs à modifier leur code. La gestion sémantique de versions (MAJOR.MINOR.PATCH) l'annonce : de 2.4.1 à 2.4.2, une correction de bug ; à 2.5.0, une fonctionnalité **backward compatible** ; à 3.0.0, des breaking changes. Lire un message d'erreur relève du même exercice : *Cannot read properties of undefined (reading 'id')* signifie que l'objet dont on lit la propriété `id` vaut `undefined`.

## Écrire en anglais technique

Un message de commit commence par un titre court, d'une cinquantaine de caractères au plus, à l'**impératif** et sans point final : *Add*, *Fix*, *Remove*, *Update*, et non *Added* ou *Fixes*. Le titre complète la phrase « If applied, this commit will… ». Après une ligne vide, le corps explique **pourquoi** le changement est nécessaire. Une issue décrit un problème de façon reproductible : étapes, comportement attendu, comportement observé, environnement.

```text
Fix race condition in token refresh

Two concurrent requests could both refresh an expired token, and the
second refresh invalidated the first one. Refresh now runs under a
lock, and waiting requests reuse the new token.

Closes #142

----------------------------------------------------------------------

Title: Login fails with a 500 error when the email contains a plus sign

Steps to reproduce:
1. Open /login.
2. Enter "jane+test@example.com" and a valid password.
3. Click "Sign in".

Expected behavior: the user is signed in and redirected to the dashboard.
Actual behavior: the page shows "Internal Server Error" (HTTP 500).
Environment: v2.3.1, Firefox, Windows 11.
```

En revue de code, on rencontre souvent *LGTM* (looks good to me, d'accord pour fusionner) et *nit* (remarque mineure, non bloquante).

## Stratégies TOEIC 900+

- **Gestion du temps en Part 7** : ses 54 questions demandent le plus de temps. Repère courant : une dizaine de minutes pour la Part 5, environ huit pour la Part 6, et au moins 55 minutes pour la Part 7. Lire la question avant le document, puis chercher l'information ciblée ; pour les documents doubles ou triples, la réponse combine souvent deux sources. Ne jamais rester bloqué, et ne laisser aucune case vide, puisqu'une mauvaise réponse ne coûte rien.
- **Priorité à la grammaire en Part 5** : regarder d'abord les quatre options. Si ce sont des formes d'un même mot ou des temps d'un même verbe, la structure de la phrase suffit (nature du mot attendu, repères *since*, *ago*, *last week*, proposition en *if*) ; seules les questions de vocabulaire exigent de comprendre toute la phrase.
- **Écoute active** : en Parts 3 et 4, lire les questions imprimées avant chaque enregistrement pour savoir quoi écouter (qui parle, où, quelle est la suite prévue). En Part 2, le premier mot de la question (*Who*, *When*, *Why*, *How*) décide de la réponse ; se méfier des options qui reprennent un mot ou un son de la question, et accepter les réponses indirectes (*Let me check the schedule*). S'entraîner chaque jour avec des conférences techniques ou des podcasts en anglais, d'abord sans sous-titres.

## À retenir

> - TOEIC L&R : Listening 100 questions en 45 min (Parts 1 à 4 : 6, 25, 39, 30), Reading 100 questions en 75 min (Parts 5 à 7 : 30, 16, 54), score de 10 à 990.
> - Faux amis : *actually* = en fait, *eventually* = finalement, *library* = bibliothèque, *to assist* = aider.
> - Prétérit avec un moment passé (*ago*, *last week*) ; present perfect avec *since* (point de départ) et *for* (durée), jamais le présent pour traduire « depuis ».
> - Passif = be + participe passé ; conditionnel de type 3 : *If we had…, we would have…* ; aucun *will* ni *would* après *if*.
> - Formes des mots : nom après un déterminant, adjectif devant un nom, adverbe en -ly pour modifier un verbe.
> - RFC 2119 : MUST obligatoire, SHOULD recommandé sauf raison valable, MAY facultatif ; *deprecated* fonctionne encore mais disparaîtra ; un *breaking change* impose une version majeure.
> - Commit : titre court à l'impératif (*Fix…*, *Add…*), puis le pourquoi ; issue : étapes, attendu, observé, environnement.
