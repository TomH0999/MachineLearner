# Architecture logicielle et systèmes distribués : couches, services, cohérence et disponibilité

L'architecture d'une application fixe les frontières entre ses parties, et donc ce qui restera simple à modifier, à tester et à faire grandir. Cette fiche part de l'organisation du code (couches, hexagone), passe au découpage en services et aux échanges par événements, puis aborde les contraintes des systèmes répartis : cohérence, quorums, montée en charge, résilience et disponibilité.

## Architecture en couches

L'**architecture en couches** range le code par responsabilité : **présentation** (interface, contrôleurs HTTP), **métier** (règles du domaine, cas d'usage) et **accès aux données** (requêtes, ORM). Les dépendances **descendent** : la présentation appelle le métier, qui appelle l'accès aux données, jamais l'inverse, et chaque couche peut évoluer derrière l'interface qu'elle offre à celle du dessus. Le piège classique est un métier qui dépend directement de la base : ses règles se mêlent au SQL, et on ne peut plus les tester sans base de données.

## Architecture hexagonale : ports et adaptateurs

L'**architecture hexagonale**, proposée par Alistair Cockburn, retourne cette dernière dépendance : le **domaine** est au centre et ne dépend d'aucune technologie. Il déclare ses besoins sous forme de **ports**, des interfaces, que des **adaptateurs** relient au monde extérieur :

- les **ports d'entrée** exposent les cas d'usage, comme « passer une commande », appelés par des adaptateurs d'entrée : contrôleur HTTP, ligne de commande, tests ;
- les **ports de sortie** décrivent ce dont le domaine a besoin, comme « enregistrer une commande » ou « envoyer un e-mail », et des adaptateurs de sortie les implémentent avec PostgreSQL, un serveur SMTP ou un broker ;
- toutes les dépendances pointent **vers le domaine** (inversion des dépendances) : pour tester le métier, il suffit de brancher des adaptateurs en mémoire, et changer de base ne touche qu'un adaptateur.

## Monolithe modulaire ou microservices

Un **monolithe** se déploie d'un seul bloc ; il est **modulaire** quand il est découpé en modules aux frontières nettes, qui ne communiquent que par leurs interfaces publiques. Les **microservices** poussent ce découpage jusqu'au déploiement : chaque service a son processus, souvent sa propre base, et communique avec les autres par le réseau.

| Critère | Monolithe modulaire | Microservices |
|---|---|---|
| Déploiement | une seule unité, une seule version en production | un pipeline par service, déploiements indépendants |
| Complexité | dans le code : appels de fonctions, débogage local | dans l'exploitation : réseau, supervision, traçage distribué |
| Scalabilité | on réplique l'application entière | chaque service grandit selon sa propre charge |
| Cohérence | transactions locales dans une seule base | cohérence à terme entre services, compensations (sagas) |
| Quand le choisir | petite équipe, domaine encore mouvant, lancement d'un produit | plusieurs équipes autonomes, besoins de charge ou de disponibilité très différents |

La **loi de Conway** observe que l'architecture d'un système reproduit l'organisation des équipes qui le construisent : des microservices sans équipes autonomes donnent souvent un « monolithe distribué », qui cumule les coûts des deux approches. Un monolithe modulaire bien découpé garde la porte ouverte, car un module aux frontières nettes s'extrait plus tard en service.

## Architecture orientée événements

Dans une **architecture orientée événements**, un service publie un **événement**, un fait passé et immuable comme « CommandeValidée », sans savoir qui le consommera. Un **broker de messages** le transmet : RabbitMQ achemine des messages vers des files, Kafka les ajoute à un journal persistant, découpé en partitions, que chaque consommateur relit à son rythme. Producteur et consommateurs sont découplés dans l'espace, car on ajoute un consommateur sans toucher au producteur, et dans le temps, car un consommateur arrêté rattrape son retard au redémarrage. En contrepartie, la cohérence entre services devient **à terme**, l'ordre n'est garanti qu'au sein d'une file ou d'une partition, et la plupart des brokers livrent **au moins une fois** : un message peut arriver deux fois, d'où des consommateurs idempotents. Pour ne perdre aucun événement entre l'écriture en base et la publication, le motif **outbox** enregistre l'événement dans la même transaction que les données, puis un relais le publie.

## Théorème CAP et cohérence

Le **théorème CAP**, conjecturé par Eric Brewer puis démontré par Gilbert et Lynch en 2002, porte sur trois propriétés d'un système réparti : la **cohérence** (C, toute lecture voit la dernière écriture), la **disponibilité** (A, toute requête reçue par un nœud en état de marche obtient une réponse) et la **tolérance aux partitions** (P, le système continue malgré des messages perdus entre nœuds). Sur un vrai réseau, les partitions finissent toujours par arriver : le choix se fait donc **pendant** une partition, entre refuser des requêtes pour rester cohérent (CP, comme etcd ou ZooKeeper) et répondre avec des données peut-être périmées (AP, comme Cassandra dans sa configuration habituelle). La **cohérence forte** (linéarisabilité) donne l'illusion d'une copie unique des données, au prix de coordination et de latence. La **cohérence à terme** (eventual consistency) garantit seulement que les répliques convergent si les écritures cessent. Hors partition, l'extension **PACELC** décrit un second compromis, entre latence et cohérence.

## Quorums

Une donnée répliquée sur $N$ nœuds est écrite sur $W$ d'entre eux et lue sur $R$. Si la condition ci-dessous est vérifiée, tout ensemble de $R$ nœuds lus a au moins un nœud en commun avec les $W$ nœuds de la dernière écriture : en gardant la réponse de version la plus récente, on lit toujours la dernière valeur.

$$
W + R > N
$$

Avec $N = 3$, $W = 2$ et $R = 2$, on a $2 + 2 = 4 > 3$, et le système tolère la panne d'un nœud en lecture comme en écriture. $W = 3$, $R = 1$ accélère les lectures mais bloque les écritures dès qu'un nœud tombe ; $W = 1$, $R = 1$ est rapide mais ne garantit plus de lire la dernière écriture, puisque $1 + 1 = 2 \leq 3$. Imposer en plus $2W > N$ empêche deux écritures concurrentes de réussir sur des ensembles de nœuds disjoints.

## Montée en charge : scalabilité, répartition et cache

La **scalabilité verticale** grossit une machine (processeur, mémoire) : simple et sans changement de code, mais plafonnée, coûteuse et sans redondance. La **scalabilité horizontale** ajoute des machines identiques derrière un **répartiteur de charge** (load balancer), qui distribue les requêtes, par tourniquet ou vers l'instance la moins chargée, et écarte celles qui échouent aux contrôles de santé. Elle suppose des instances **sans état** : sessions et fichiers vivent dans une base, un cache partagé ou un stockage d'objets, pour qu'une requête puisse arriver sur n'importe quelle instance.

Un **cache** garde à portée les résultats coûteux ou souvent lus : un CDN pour les fichiers statiques, un cache en mémoire partagé, comme Redis, pour les données. En mode **cache-aside**, l'application lit d'abord le cache, et en cas d'absence lit la base puis remplit le cache avec une durée de vie (TTL). La difficulté est l'**invalidation** : après une écriture, il faut supprimer ou mettre à jour l'entrée, sinon les lecteurs voient une valeur périmée jusqu'à l'expiration du TTL.

## Résilience : idempotence et disjoncteur

Sur un réseau, un appel peut expirer alors que le serveur l'a bien traité, et le client ne sait pas s'il doit réessayer. Une nouvelle tentative n'est sûre que si l'opération est **idempotente**, c'est-à-dire si l'appliquer plusieurs fois revient à l'appliquer une seule fois :

$$
f(f(x)) = f(x)
$$

En HTTP, GET, PUT et DELETE sont idempotents par définition, POST ne l'est pas. Pour rendre idempotente une création ou un paiement, le client joint une **clé de requête** unique ; le serveur mémorise la réponse associée et la renvoie telle quelle si la même clé revient. Les nouvelles tentatives s'espacent de façon exponentielle, avec un peu d'aléa (jitter), pour ne pas submerger un service qui redémarre.

Un **disjoncteur** (circuit breaker) protège l'appelant d'un service en panne. **Fermé**, il laisse passer les appels et compte les échecs ; au-delà d'un seuil, il s'**ouvre** et rejette aussitôt les appels, ou renvoie une valeur de repli, au lieu d'attendre des délais d'expiration. Après un temps d'attente, il passe **semi-ouvert** : quelques appels d'essai décident s'il se referme ou s'ouvre de nouveau. Associé à des délais d'expiration courts, il empêche une panne locale de se propager en cascade.

## Conteneurs, machines virtuelles et Kubernetes

Une **machine virtuelle** émule un ordinateur complet grâce à un **hyperviseur** : elle embarque son propre noyau et son système d'exploitation, d'où une isolation forte, mais des images plus lourdes et un démarrage plus lent. Un **conteneur** n'est qu'un groupe de processus de l'hôte, isolé par les **namespaces** (vue propre des fichiers, du réseau, des PID) et limité par les **cgroups** (processeur, mémoire) : il partage le noyau de l'hôte, démarre très vite et se construit à partir d'une **image** en couches, identique du poste du développeur à la production.

**Kubernetes** orchestre des conteneurs sur un ensemble de machines, les nœuds. On lui décrit un **état voulu**, et des boucles de contrôle corrigent sans cesse l'écart avec l'état réel. Le **pod** est la plus petite unité déployable : un ou plusieurs conteneurs qui partagent une adresse IP et peuvent partager des volumes. Un **Deployment** maintient le nombre voulu de réplicas d'un pod, recrée ceux qui tombent et remplace progressivement les anciens lors d'une mise à jour (rolling update) ; un **Service** donne à ces pods éphémères une adresse stable et répartit le trafic entre eux.

## Calculer une disponibilité

La **disponibilité** $A$ est la fraction du temps pendant laquelle un service répond correctement. Quand une requête traverse plusieurs composants **en série**, elle échoue dès que l'un d'eux est en panne ; en supposant les pannes indépendantes, les disponibilités se multiplient :

$$
A = \prod_{i=1}^{n} A_i
$$

Deux services à 99,9 % en série donnent $0{,}999^2 = 0{,}998001$, soit environ **99,80 %** : une chaîne est toujours moins disponible que son maillon le plus faible. Avec des répliques **en parallèle**, le système ne tombe que si toutes les répliques tombent en même temps :

$$
A = 1 - \prod_{i=1}^{n} (1 - A_i)
$$

Deux répliques à 99 % donnent $1 - 0{,}01^2 = 0{,}9999$, soit **99,99 %** : la redondance fait gagner deux « neuf ». Une année compte $365 \times 24 = 8760$ heures, ce qui traduit chaque objectif de disponibilité en temps de panne autorisé. L'hypothèse d'indépendance reste la limite de ces calculs : deux répliques dans le même centre de données peuvent tomber ensemble.

| Disponibilité | Panne autorisée par an |
|---|---|
| 99 % | 87,6 h, soit environ 3,65 jours |
| 99,9 % | $0{,}001 \times 8760 = 8{,}76$ h |
| 99,99 % | environ 52,6 min |
| 99,999 % | environ 5,3 min |

## Exemple concret : EngiPath

EngiPath est un **monolithe modulaire** : un seul déploiement Next.js sert l'interface et la logique serveur, les mutations, comme la correction d'un quiz ou la révision d'une carte, passent par des Server Actions, et toutes les données vivent dans une base PostgreSQL managée. Le contenu pédagogique, qui ne change qu'à la publication d'un nouveau pack, est mis en cache côté serveur, tandis que la progression de chaque utilisateur est relue en base. Le code reste découpé en modules, comme l'arbre de compétences, les quiz, la révision espacée et l'authentification, chacun derrière sa propre interface.

Ce choix convient à une petite équipe qui travaille sur un seul domaine : un seul déploiement, un seul pipeline, et des transactions locales, puisque contenu, tentatives de quiz et progression vivent dans la même base. Des microservices n'apporteraient ici que leurs coûts : appels réseau, cohérence à terme, supervision multipliée. Un découpage se justifierait si une partie avait des besoins très différents du reste, comme une charge de calcul lourde et indépendante (générer du contenu automatiquement, par exemple), une exigence de disponibilité propre, ou plusieurs équipes devant livrer chacune à son rythme ; on extrairait alors d'abord ce module, déjà isolé derrière son interface. Côté disponibilité, l'application dépend en série de son hébergeur et de sa base : la formule du produit s'applique.

## En pratique avec Python

Le code suivant vérifie les calculs de disponibilité, contrôle la condition de quorum en énumérant tous les ensembles de nœuds avec `itertools.combinations`, puis montre comment une clé de requête rend un débit rejouable sans risque.

```python
from itertools import combinations
from math import prod

# 1. Disponibilité en série et en parallèle (pannes supposées indépendantes)
def serie(*dispos):
    return prod(dispos)

def parallele(*dispos):
    return 1 - prod(1 - a for a in dispos)

print(f"{serie(0.999, 0.999):.2%}")                 # 99.80%
print(f"{parallele(0.99, 0.99):.2%}")               # 99.99%
print(f"{(1 - 0.999) * 365 * 24:.2f} h par an")     # 8.76 h par an

# 2. Quorum : chaque ensemble de R nœuds lus recoupe-t-il chaque ensemble de W nœuds écrits ?
def recouvrement(n, w, r):
    noeuds = range(n)
    return all(set(e) & set(l)
               for e in combinations(noeuds, w)
               for l in combinations(noeuds, r))

for n, w, r in [(3, 2, 2), (3, 1, 2), (5, 3, 3)]:
    print(n, w, r, w + r > n, recouvrement(n, w, r))
# 3 2 2 True True
# 3 1 2 False False
# 5 3 3 True True

# 3. Idempotence : la clé de requête rend un débit rejouable sans risque
soldes = {"alice": 100}
reponses = {}                                       # clé de requête -> réponse déjà envoyée

def debiter(cle, compte, montant):
    if cle in reponses:                             # requête rejouée : même réponse, aucun effet
        return reponses[cle]
    soldes[compte] -= montant
    reponses[cle] = {"compte": compte, "solde": soldes[compte]}
    return reponses[cle]

print(debiter("req-42", "alice", 30))               # {'compte': 'alice', 'solde': 70}
# La réponse s'est perdue : le client renvoie la même requête, avec la même clé
print(debiter("req-42", "alice", 30))               # {'compte': 'alice', 'solde': 70}
print(debiter("req-43", "alice", 30), soldes)       # {'compte': 'alice', 'solde': 40} {'alice': 40}
```

## À retenir

> - Couches : les dépendances descendent. Hexagone : le domaine, au centre, définit des ports que des adaptateurs implémentent, et toutes les dépendances pointent vers lui.
> - Commencer par un monolithe modulaire ; les microservices offrent des déploiements et une mise à l'échelle indépendants, au prix d'une complexité opérationnelle et d'une cohérence à terme.
> - Un broker découple producteurs et consommateurs ; sa livraison « au moins une fois » impose des consommateurs idempotents, et un disjoncteur évite qu'une panne se propage.
> - CAP : pendant une partition, il faut choisir entre cohérence (CP) et disponibilité (AP). Quorum : $W + R > N$, par exemple $N = 3$, $W = 2$, $R = 2$.
> - Scalabilité horizontale : des instances sans état derrière un répartiteur de charge ; tout cache exige une stratégie d'invalidation.
> - Conteneur : des processus isolés qui partagent le noyau de l'hôte ; machine virtuelle : une machine complète. Kubernetes gère des pods au travers de Deployments.
> - Disponibilité : produit en série ($0{,}999^2 \approx 99{,}80\,\%$), $1 - \prod (1 - A_i)$ en parallèle ($1 - 0{,}01^2 = 99{,}99\,\%$) ; 99,9 % autorise 8,76 h de panne par an.
