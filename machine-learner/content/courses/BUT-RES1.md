# Réseaux, ligne de commande Linux et administration système

Un message envoyé sur Internet traverse une pile de protocoles, chacun chargé d'un problème précis : transmettre des bits, trouver un chemin, garantir la livraison, puis servir l'application. Cette fiche présente ces couches, l'adressage IPv4 et les services qui le font fonctionner, puis les outils de base pour administrer une machine Linux en ligne de commande.

## Modèle OSI et modèle TCP/IP

Le **modèle OSI** découpe la communication en **7 couches** : chacune rend un service à la couche du dessus et s'appuie sur celle du dessous, ce qui permet de changer de support physique sans toucher aux applications. Pour retenir l'ordre de la couche 1 à la couche 7 : « Pour Le Réseau, Tout Se Passe Automatiquement ».

| N° | Couche | Rôle | Exemple de protocole |
|---|---|---|---|
| 7 | Application | services réseau offerts aux programmes | HTTP, DNS, SSH |
| 6 | Présentation | représentation des données : encodage, compression, chiffrement | TLS, MIME |
| 5 | Session | ouverture, synchronisation et fermeture des dialogues | RPC, NetBIOS |
| 4 | Transport | communication de bout en bout entre processus, désignés par des ports | TCP, UDP |
| 3 | Réseau | adressage logique et routage entre réseaux | IP, ICMP |
| 2 | Liaison de données | trames entre machines d'un même réseau local, adresses MAC | Ethernet, Wi-Fi (802.11) |
| 1 | Physique | transmission des bits sur le support : cuivre, fibre, ondes radio | 100BASE-TX, DSL |

Le **modèle TCP/IP**, celui qu'implémentent réellement les systèmes, n'a que **4 couches** : accès réseau (couches 1 et 2 d'OSI), Internet (IP), transport (TCP, UDP) et application (couches 5 à 7). Les rôles de session et de présentation y sont assurés par l'application ou par TLS, ce qui explique que le classement de certains protocoles varie selon les sources. À l'émission, chaque couche **encapsule** les données de la couche du dessus en y ajoutant son propre en-tête : les données applicatives deviennent un **segment** TCP, puis un **paquet** IP, puis une **trame** Ethernet. Le destinataire retire ces en-têtes dans l'ordre inverse. Les équipements se rangent eux aussi par couche : un **commutateur** (switch) relaie des trames d'après les adresses MAC (couche 2), un **routeur** relaie des paquets d'après les adresses IP (couche 3).

## TCP, UDP et ports

**TCP** (Transmission Control Protocol) est **orienté connexion** : il numérote les octets envoyés, acquitte ce qu'il reçoit, retransmet ce qui est perdu, remet les données dans l'ordre et régule son débit (contrôle de flux et de congestion). **UDP** (User Datagram Protocol) envoie des **datagrammes** indépendants, sans connexion, sans acquittement ni retransmission ; son en-tête ne fait que 8 octets, contre 20 au minimum pour TCP. On choisit TCP quand chaque octet compte (web, transfert de fichiers, SSH) et UDP quand la fraîcheur prime sur la complétude (voix sur IP, jeu en ligne, la plupart des requêtes DNS).

Avant tout échange de données, TCP ouvre la connexion par une **poignée de main en 3 temps** (three-way handshake), qui permet à chaque côté d'annoncer son numéro de séquence initial et de le faire acquitter :

1. le client envoie **SYN**, avec son numéro de séquence initial $x$ ;
2. le serveur répond **SYN-ACK** : son propre numéro initial $y$ et l'acquittement $x + 1$ ;
3. le client confirme par **ACK**, avec l'acquittement $y + 1$ : la connexion est établie.

La fermeture passe par des segments **FIN**, un dans chaque sens, chacun acquitté. Un **port**, entier sur 16 bits, désigne le processus visé sur la machine : le serveur écoute sur un port connu, le client utilise un port temporaire choisi par son système. Une connexion TCP est identifiée par le quadruplet (IP source, port source, IP destination, port destination). Quatre ports sont à connaître : **22** pour SSH (shell distant chiffré, copie de fichiers avec scp ou sftp), **53** pour DNS (en UDP, et en TCP pour les grosses réponses), **80** pour HTTP (web en clair) et **443** pour HTTPS (web chiffré par TLS).

## Adressage IPv4 et sous-réseaux

Une adresse **IPv4** compte 32 bits, écrits sous forme de 4 octets décimaux, comme 192.168.10.77. Elle se divise en une partie **réseau** et une partie **machine**. La notation **CIDR** /$p$ indique que les $p$ premiers bits désignent le réseau ; le **masque** met ces $p$ bits à 1, et un ET bit à bit entre l'adresse et le masque donne l'adresse du réseau. Dans chaque sous-réseau, deux adresses sont réservées : celle du **réseau** (bits machine tous à 0) et celle de **diffusion** (broadcast, bits machine tous à 1), qui joint toutes les machines du sous-réseau. Il reste donc :

$$
\text{nombre de machines} = 2^{32-p} - 2
$$

**Exemple : 192.168.10.0/26.** Le préfixe /26 laisse $32 - 26 = 6$ bits machine. Le masque vaut 255.255.255.192, car le dernier octet $11000000_2$ vaut $128 + 64 = 192$. Chaque sous-réseau contient $2^6 = 64$ adresses, dont $64 - 2 = 62$ machines. Le réseau 192.168.10.0/24 se découpe ainsi en 4 sous-réseaux /26, qui avancent par pas de 64 :

| Sous-réseau | Adresse du réseau | Machines | Diffusion |
|---|---|---|---|
| 192.168.10.0/26 | .0 | .1 à .62 | .63 |
| 192.168.10.64/26 | .64 | .65 à .126 | .127 |
| 192.168.10.128/26 | .128 | .129 à .190 | .191 |
| 192.168.10.192/26 | .192 | .193 à .254 | .255 |

L'adresse 192.168.10.77 appartient au sous-réseau **192.168.10.64/26** : son dernier octet vérifie $01001101_2 \text{ ET } 11000000_2 = 01000000_2 = 64$. Ses voisines directes vont de .65 à .126, et sa diffusion est 192.168.10.127. Deux machines du même sous-réseau communiquent directement ; sinon, elles passent par la **passerelle** par défaut, un routeur. Les plages **privées** 10.0.0.0/8, 172.16.0.0/12 et 192.168.0.0/16 ne sont pas routées sur Internet : une box les traduit vers son adresse publique (NAT).

## DNS, DHCP et ARP

Trois services rendent un réseau utilisable sans configuration manuelle :

- **DNS** (port 53) traduit un nom comme `example.com` en adresse IP. Si la réponse n'est pas en cache, le résolveur interroge un serveur racine, puis celui du domaine de premier niveau (`.com`), puis le serveur qui fait autorité pour le domaine ; chaque réponse reste en cache pendant sa durée de vie (TTL) ;
- **DHCP** attribue à une machine qui arrive sur le réseau son adresse IP, son masque, sa passerelle et ses serveurs DNS, pour une durée limitée appelée **bail**, en 4 messages : DISCOVER, OFFER, REQUEST, ACK ;
- **ARP** fait le lien entre les couches 3 et 2 : pour envoyer un paquet à une adresse IP du réseau local, la machine diffuse « qui possède cette adresse IP ? », et la machine concernée répond avec son adresse **MAC**, que l'émetteur garde en cache. Pour une destination hors du sous-réseau, c'est l'adresse MAC de la passerelle qu'on cherche.

Pour diagnostiquer une panne, on remonte les couches : `ip addr` (adresse obtenue ?), `ip route` (passerelle ?), `ping` vers la passerelle puis vers une adresse publique (routage ?), `dig` ou `nslookup` (résolution de noms ?), et `ss -tlnp` sur le serveur (le service écoute-t-il sur le bon port ?).

## Ligne de commande Linux

Le **shell** (le plus souvent Bash) lit des commandes et les exécute. L'arborescence part de la racine `/` ; un chemin est **absolu** s'il commence par `/`, **relatif** sinon, `.` désigne le répertoire courant, `..` son parent et `~` le répertoire personnel. Les commandes de base : `pwd` affiche le répertoire courant, `ls -l` liste les fichiers avec leurs droits, `cd` change de répertoire, `cp`, `mv` et `rm` copient, déplacent et suppriment, `mkdir` crée un répertoire, `cat` et `less` affichent un fichier. `grep` cherche un motif dans un contenu, et `find` cherche des fichiers dans une arborescence d'après leur nom, leur type, leur taille ou leur date.

Chaque processus dispose de trois flux : l'**entrée standard** (descripteur 0), la **sortie standard** (1) et la **sortie d'erreur** (2). Le shell peut les rediriger :

| Syntaxe | Effet |
|---|---|
| `cmd > f` | écrit la sortie standard dans `f`, en écrasant son contenu |
| `cmd >> f` | ajoute la sortie standard à la fin de `f` |
| `cmd 2> f` | écrit la sortie d'erreur dans `f` |
| `cmd > f 2>&1` | envoie les deux flux dans `f` : le descripteur 2 va là où pointe déjà le 1 |
| `cmd < f` | lit l'entrée standard depuis `f` |
| `cmd1 \| cmd2` | branche la sortie standard de `cmd1` sur l'entrée standard de `cmd2` |

L'ordre des redirections compte : dans `cmd 2>&1 > f`, la sortie d'erreur est copiée vers la destination **actuelle** de la sortie standard, le terminal, avant que celle-ci ne soit redirigée vers `f`. Les erreurs restent donc à l'écran.

## Droits sur les fichiers

Chaque fichier a un **propriétaire**, un **groupe** et trois triplets de droits : pour le propriétaire (u), le groupe (g) et les autres (o). Sur un fichier, `r` permet de lire, `w` de modifier et `x` d'exécuter ; sur un répertoire, `r` permet de lister, `w` (avec `x`) d'y créer ou supprimer des entrées et `x` de le traverser. En **octal**, chaque triplet est la somme de $r = 4$, $w = 2$ et $x = 1$ :

| Octal | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| Binaire | 000 | 001 | 010 | 011 | 100 | 101 | 110 | 111 |
| Droits | `---` | `--x` | `-w-` | `-wx` | `r--` | `r-x` | `rw-` | `rwx` |

**Décodage de `chmod 754`.** Le premier chiffre concerne le propriétaire, $7 = 4 + 2 + 1$ donne `rwx` ; le deuxième le groupe, $5 = 4 + 1$ donne `r-x` ; le troisième les autres, $4$ donne `r--`. Le fichier a donc les droits `rwxr-xr--`, que `ls -l` affiche précédés d'un `-` pour un fichier ordinaire. La forme symbolique modifie un droit sans toucher aux autres, comme `chmod u+x script.sh` ou `chmod go-w notes.txt`, et `chown alice:dev fichier` change le propriétaire et le groupe.

## Processus et signaux

Chaque programme lancé devient un **processus**, identifié par un **PID** et rattaché à un processus parent (PPID). `ps aux` liste tous les processus avec leur propriétaire et leur consommation de processeur et de mémoire, et `top` les affiche en temps réel. On agit sur un processus en lui envoyant un **signal** avec `kill`. **SIGTERM** (15), le signal par défaut de `kill`, demande un arrêt propre : le programme peut l'intercepter pour fermer ses fichiers, voire l'ignorer. **SIGKILL** (9), envoyé par `kill -9`, ne peut être ni intercepté ni ignoré : le noyau termine le processus sur-le-champ, au risque de laisser des fichiers à moitié écrits : on ne l'emploie que si SIGTERM reste sans effet. **SIGINT** (2) est envoyé par Ctrl+C, et **SIGHUP** (1) signale la fermeture du terminal ; beaucoup de démons le détournent pour recharger leur configuration.

## Services avec systemd

Sur la plupart des distributions, **systemd** est le premier processus lancé (PID 1) : il démarre et surveille les **services**, décrits par des fichiers d'**unité**. Un fichier `.service` indique la commande à lancer (`ExecStart`), la politique de redémarrage (`Restart=on-failure`), l'utilisateur qui l'exécute (`User`) et la cible de démarrage à laquelle se rattacher (`WantedBy=multi-user.target`).

`systemctl start` et `stop` lancent ou arrêtent le service tout de suite, `enable` et `disable` décident s'il démarre avec la machine, `restart` le relance et `status` affiche son état et ses dernières lignes de journal. Après avoir modifié un fichier d'unité, `systemctl daemon-reload` le fait relire. Les journaux complets se lisent avec `journalctl -u nom-du-service`.

## En pratique

Les commandes suivantes illustrent les notions de la fiche ; elles n'affichent ici aucune sortie, car celle-ci dépend de la machine.

```bash
# Compter les lignes qui contiennent "error" : grep filtre, wc -l compte
grep -i "error" app.log | wc -l
# Lancer un script en envoyant sortie standard ET erreurs dans le même fichier
./sauvegarde.sh > sauvegarde.log 2>&1
# Ajouter une ligne à la fin d'un fichier (>>) au lieu de l'écraser (>)
date >> historique.txt
# Chercher les fichiers .log modifiés depuis moins de 7 jours
find /var/log -name "*.log" -mtime -7
# Droits 754 : rwx pour le propriétaire, r-x pour le groupe, r-- pour les autres
chmod 754 sauvegarde.sh
ls -l sauvegarde.sh
# Trouver le PID d'un processus, demander l'arrêt (SIGTERM), forcer en dernier recours (SIGKILL)
ps aux | grep nginx
kill 1234
kill -9 1234
# État du service, démarrage automatique et lancement immédiat, journaux en direct
systemctl status nginx
sudo systemctl enable --now nginx
journalctl -u nginx -f
```

Le module `ipaddress` de la bibliothèque standard de Python vérifie les calculs de sous-réseaux de l'exemple :

```python
import ipaddress

# 1. Le sous-réseau 192.168.10.0/26
reseau = ipaddress.ip_network("192.168.10.0/26")
print(reseau.netmask, reseau.num_addresses)        # 255.255.255.192 64
print(len(list(reseau.hosts())), reseau.broadcast_address)  # 62 192.168.10.63

# 2. Découper 192.168.10.0/24 en sous-réseaux /26
parent = ipaddress.ip_network("192.168.10.0/24")
sous_reseaux = list(parent.subnets(new_prefix=26))
print([str(s) for s in sous_reseaux])
# ['192.168.10.0/26', '192.168.10.64/26', '192.168.10.128/26', '192.168.10.192/26']

# 3. Dans quel sous-réseau se trouve 192.168.10.77 ?
hote = ipaddress.ip_address("192.168.10.77")
for s in sous_reseaux:
    if hote in s:
        machines = list(s.hosts())
        print(s, machines[0], machines[-1], s.broadcast_address)
# 192.168.10.64/26 192.168.10.65 192.168.10.126 192.168.10.127
```

## À retenir

> - OSI compte 7 couches et TCP/IP 4 ; le routage IP relève de la couche 3, les adresses MAC de la couche 2, les ports de la couche 4.
> - TCP est fiable et ordonné, avec une poignée de main SYN, SYN-ACK, ACK ; UDP est sans connexion, plus léger, sans garantie. Ports : 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS.
> - Un /$p$ laisse $32 - p$ bits machine, soit $2^{32-p} - 2$ machines ; un /26 a le masque 255.255.255.192 et 62 machines, et 192.168.10.77 appartient à 192.168.10.64/26.
> - DNS traduit les noms en adresses, DHCP distribue la configuration IP, ARP trouve l'adresse MAC d'une adresse IP locale.
> - `>` écrase, `>>` ajoute, `2>&1` envoie les erreurs là où va la sortie standard, `|` enchaîne les commandes.
> - `chmod 754` donne `rwxr-xr--`, avec $r = 4$, $w = 2$, $x = 1$ ; `kill` envoie SIGTERM, `kill -9` SIGKILL ; `systemctl enable` fait démarrer un service avec la machine.
