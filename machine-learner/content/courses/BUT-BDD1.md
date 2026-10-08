# Bases de données relationnelles et SQL

Une base de données relationnelle range l'information dans des tables reliées par des clés, et le SGBD garantit que ces liens restent cohérents, même quand de nombreux utilisateurs écrivent en même temps. Cette fiche part de la modélisation et de la normalisation, présente les requêtes SQL essentielles, les index, les transactions et la sécurité, puis donne un aperçu du NoSQL.

## Modélisation : du MCD au MLD

Le **modèle conceptuel de données** (MCD, méthode Merise) décrit le domaine sans parler de tables : des **entités** (Étudiant, Module) avec leurs attributs et un identifiant, et des **associations** entre elles (un étudiant *obtient une note dans* un module). Chaque patte d'association porte une **cardinalité** (min, max) : (0,n) se lit « zéro ou plusieurs », (1,1) « exactement un ». Le passage au **modèle logique** (MLD), c'est-à-dire aux tables, suit deux règles :

- association **1:N** (un client passe plusieurs commandes, une commande appartient à un seul client) : l'identifiant du côté 1 devient une **clé étrangère** dans la table du côté N, ici `commande.client_id` ;
- association **N:N** (un étudiant suit plusieurs modules, un module accueille plusieurs étudiants) : elle devient une **table d'association** dont la clé primaire combine les deux clés étrangères, ici `note(etudiant_id, module_id)`. Les attributs portés par l'association, comme la valeur de la note, vont dans cette table.

## Clés et intégrité référentielle

Une **clé primaire** identifie chaque ligne : elle est unique et non nulle. Une **clé étrangère** référence la clé primaire d'une autre table, et le SGBD refuse toute ligne qui pointerait vers une ligne inexistante : c'est l'**intégrité référentielle**. Il reste à décider ce qui arrive quand on supprime la ligne référencée. Par défaut (`NO ACTION` ou `RESTRICT`), la suppression est refusée tant que des lignes en dépendent ; avec `ON DELETE CASCADE`, les lignes dépendantes sont supprimées avec elle ; avec `ON DELETE SET NULL`, leur clé étrangère passe à NULL. Le schéma utilisé dans toute la fiche : la table `note` matérialise l'association N:N, sa clé primaire composite interdit deux notes pour le même couple (étudiant, module), et supprimer un étudiant ou un module supprime ses notes. Le jeu de données compte 4 étudiants (Alice, Bruno, Chloé et David, qui n'a aucune note), 3 modules (BDD, WEB, RES) et 8 notes.

```sql
CREATE TABLE etudiant (id INTEGER PRIMARY KEY, nom TEXT NOT NULL);
CREATE TABLE module (id INTEGER PRIMARY KEY, code TEXT NOT NULL UNIQUE);
CREATE TABLE note (
  etudiant_id INTEGER NOT NULL REFERENCES etudiant(id) ON DELETE CASCADE,
  module_id   INTEGER NOT NULL REFERENCES module(id) ON DELETE CASCADE,
  valeur      REAL NOT NULL CHECK (valeur BETWEEN 0 AND 20),
  PRIMARY KEY (etudiant_id, module_id)
);
```

## Normalisation : 1NF, 2NF et 3NF

Normaliser, c'est découper les tables pour que chaque fait ne soit stocké qu'une fois. La redondance provoque des **anomalies** : de mise à jour (une même information à modifier sur plusieurs lignes, au risque d'en oublier une), d'insertion (impossible d'enregistrer un produit tant que personne ne l'a commandé) et de suppression (effacer la dernière commande d'un client fait perdre sa ville). L'outil d'analyse est la **dépendance fonctionnelle** $X \to Y$ : connaître $X$ suffit pour connaître $Y$. Point de départ : `commande(num, client, ville_client, produit, prix_unitaire, quantite)`, où une commande peut contenir plusieurs produits.

| num | client | ville_client | produit | prix_unitaire | quantite |
|---|---|---|---|---|---|
| 1 | Dupont | Lyon | stylo, cahier | 1.50, 3.00 | 10, 2 |
| 2 | Dupont | Lyon | stylo | 1.50 | 5 |

1. **1NF : des valeurs atomiques.** La commande 1 range deux produits dans une même cellule : impossible de filtrer ou de totaliser proprement. On crée une ligne par produit commandé. Le numéro ne suffit alors plus à identifier une ligne, puisque `num` ne détermine ni `produit` ni `quantite` ; c'est le couple qui le fait, `(num, produit) → quantite`, et la clé devient **(num, produit)**.
2. **2NF : chaque attribut non clé dépend de toute la clé.** Les dépendances `num → client, ville_client` et `produit → prix_unitaire` ne portent que sur une partie de la clé : ce sont des **dépendances partielles**. Le client est recopié sur chaque ligne de la commande, et le prix sur chaque commande du produit. On sépare `commande(num, client, ville_client)`, `produit(produit, prix_unitaire)` et `ligne_commande(num, produit, quantite)`, où seule la quantité dépend du couple entier.
3. **3NF : aucun attribut non clé ne dépend d'un autre attribut non clé.** Dans `commande`, on a `num → client` et `client → ville_client` : la ville dépend de la clé **par transitivité**, si bien qu'un client qui déménage oblige à modifier toutes ses commandes. On extrait `client(client, ville_client)`, et il reste `commande(num, client)`. Le résultat en 3NF compte quatre tables reliées par des clés étrangères : `client(client, ville_client)`, `commande(num, client)`, `produit(produit, prix_unitaire)` et `ligne_commande(num, produit, quantite)`. Dans une vraie application, on recopie en plus le prix payé dans `ligne_commande` : c'est une donnée historique, qui ne doit pas changer quand le tarif du produit évolue.

## Requêtes SQL : jointures, agrégats, sous-requêtes

Une requête s'écrit `SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY`, mais s'évalue dans un autre ordre : `FROM` et les jointures, puis `WHERE` qui filtre les **lignes**, `GROUP BY` qui forme les groupes, `HAVING` qui filtre les **groupes**, `SELECT` qui calcule les colonnes, et enfin `ORDER BY`. C'est pourquoi `WHERE` ne peut pas contenir d'agrégat (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`), alors que `HAVING` est fait pour cela. Une **jointure interne** (`INNER JOIN`) ne garde que les lignes qui trouvent une correspondance des deux côtés. Une **jointure externe gauche** (`LEFT JOIN`) garde toutes les lignes de la table de gauche et remplit de NULL les colonnes de droite quand il n'y a pas de correspondance.

```sql
SELECT e.nom, m.code, n.valeur
FROM note n
INNER JOIN etudiant e ON e.id = n.etudiant_id
INNER JOIN module m ON m.id = n.module_id
WHERE n.valeur >= 12
ORDER BY e.nom, m.code;

SELECT e.nom, COUNT(n.valeur) AS nb_notes
FROM etudiant e
LEFT JOIN note n ON n.etudiant_id = e.id
GROUP BY e.id, e.nom
ORDER BY e.nom;

SELECT e.nom, COUNT(*) AS nb_notes, ROUND(AVG(n.valeur), 2) AS moyenne
FROM etudiant e
INNER JOIN note n ON n.etudiant_id = e.id
GROUP BY e.id, e.nom
HAVING AVG(n.valeur) >= 10
ORDER BY moyenne DESC;
```

La première requête renvoie les 5 notes d'au moins 12, avec le nom de l'étudiant et le code du module. La seconde liste les 4 étudiants, dont David avec 0 note : avec un `INNER JOIN`, il aurait disparu. Attention à l'agrégat : `COUNT(n.valeur)` ignore les NULL et donne bien 0, alors que `COUNT(*)` compterait la ligne de David complétée par des NULL et donnerait 1. Dans la troisième, `HAVING` écarte Bruno, dont la moyenne vaut 9.5, et garde Chloé (14.67) puis Alice (12.0). Un `WHERE n.valeur >= 10` répondrait à une autre question : il retirerait les notes inférieures à 10 **avant** le calcul, et la moyenne d'Alice passerait à 13.5, celle de Bruno à 11. Une **sous-requête** s'emploie là où une valeur ou une liste est attendue : `SELECT nom FROM etudiant WHERE id NOT IN (SELECT etudiant_id FROM note)` renvoie les étudiants sans note, ici David. Si la sous-requête peut renvoyer un NULL, `NOT IN` ne renvoie plus aucune ligne ; on préfère alors `NOT EXISTS`.

## Index B-tree

Sans index, une recherche `WHERE module_id = 2` oblige le SGBD à **parcourir toute la table**. Un **index B-tree** est un arbre équilibré qui garde les valeurs de la colonne triées, chacune associée à l'emplacement de sa ligne : on trouve une valeur en un nombre d'étapes qui croît comme $\log n$, et l'index sert aussi aux tris (`ORDER BY`) et aux intervalles (`BETWEEN`, `<`, `>`). Dans l'exemple ci-dessous, `EXPLAIN QUERY PLAN` passe de `SCAN note` (lecture complète) à `SEARCH note USING INDEX` après `CREATE INDEX idx_note_module ON note(module_id)`. Un index a un coût : il occupe de la place, et **chaque écriture** (`INSERT`, `DELETE`, `UPDATE` de la colonne indexée) doit aussi le mettre à jour. Il ne rapporte que sur une colonne **sélective**, dont une valeur ne correspond qu'à peu de lignes : un email unique, oui ; un booléen vrai pour 95 % des lignes, non, car lire presque toute la table par l'index est plus lent qu'un parcours direct. Pour un **index composite** (a, b), l'ordre compte : il sert d'abord les requêtes qui filtrent sur a, ou sur a et b. Les clés primaires et les contraintes `UNIQUE` sont indexées automatiquement.

## Transactions ACID et isolation

Une **transaction** regroupe plusieurs opérations qui doivent réussir ou échouer ensemble. Elle respecte les propriétés **ACID** : **atomicité** (tout ou rien, même en cas de panne), **cohérence** (les contraintes restent vérifiées), **isolation** (les transactions concurrentes ne voient pas les états intermédiaires des autres) et **durabilité** (une transaction validée par `COMMIT` survit à une panne). `ROLLBACK` annule tout ce qui a été fait depuis `BEGIN`. Ci-dessous, supprimer Alice efface aussi ses 3 notes par cascade : la table `note` passe de 8 à 5 lignes dans la transaction. Après `ROLLBACK`, Alice et ses notes sont de retour, et on compte de nouveau 8 lignes.

```sql
BEGIN;
DELETE FROM etudiant WHERE id = 1;
SELECT COUNT(*) FROM note;
ROLLBACK;
SELECT COUNT(*) FROM note;
```

Une isolation parfaite coûte cher en performances ; la norme SQL définit donc quatre niveaux, selon les anomalies évitées. Une **lecture sale** lit une modification qu'une autre transaction n'a pas encore validée, et qu'elle annulera peut-être. Une **lecture non répétable** relit une ligne et la trouve modifiée par une autre transaction validée entre-temps. Une **lecture fantôme** relance une requête avec la même condition et voit apparaître ou disparaître des lignes. Le tableau donne le minimum exigé par la norme ; un SGBD peut faire mieux : PostgreSQL utilise READ COMMITTED par défaut, et son REPEATABLE READ empêche aussi les lectures fantômes.

| Niveau d'isolation | Lecture sale | Lecture non répétable | Lecture fantôme |
|---|---|---|---|
| READ UNCOMMITTED | possible | possible | possible |
| READ COMMITTED | évitée | possible | possible |
| REPEATABLE READ | évitée | évitée | possible |
| SERIALIZABLE | évitée | évitée | évitée |

## Injection SQL et requêtes préparées

Construire une requête en **concaténant** une saisie utilisateur permet à celle-ci de modifier la requête elle-même. Avec la saisie `' OR '1'='1`, la condition `WHERE nom = '…'` devient `WHERE nom = '' OR '1'='1'`, toujours vraie : la requête renvoie toute la table. Une **requête préparée** envoie le texte SQL avec des emplacements `?` (ou `$1` en PostgreSQL), puis les valeurs à part : la saisie reste une donnée et n'est jamais interprétée comme du SQL. Échapper les apostrophes à la main est fragile ; un ORM comme Prisma utilise des requêtes préparées pour ses requêtes ordinaires.

## Introduction au NoSQL

Le terme **NoSQL** regroupe des bases qui n'utilisent pas le modèle relationnel. Une base **orientée documents** (MongoDB) stocke des documents de type JSON au schéma souple, où l'on imbrique les données lues ensemble, comme une fiche produit avec ses caractéristiques et ses avis. Une base **clé-valeur** (Redis) associe une valeur à une clé et y accède directement par celle-ci : cache, sessions, compteurs, files d'attente. Ces bases se répartissent facilement sur plusieurs serveurs, mais les jointures et les contraintes entre collections y sont limitées ou absentes. Le relationnel reste le choix par défaut pour des données structurées, très liées et soumises à des contraintes fortes ; le NoSQL convient aux données au schéma variable, lues d'un bloc, ou à un accès très rapide par clé.

## Exemple concret : EngiPath

La base d'EngiPath applique ces principes. La progression d'un utilisateur sur un module de l'arbre est enregistrée dans une table de progression, munie d'une **contrainte d'unicité composite** sur le couple (utilisateur, module) : le SGBD refuse une seconde ligne pour le même couple, et l'application peut écrire « créer ou mettre à jour » sans risquer de doublon. Pour la répétition espacée, l'état de chaque flashcard porte une date d'échéance, et un **index composite (utilisateur, date d'échéance)** permet de trouver les cartes à réviser aujourd'hui en descendant dans l'arbre de l'index au lieu de lire les cartes de tous les utilisateurs. Enfin, toutes les tables de progression référencent l'utilisateur avec une **suppression en cascade** : supprimer un compte efface sa progression, ses états de flashcards et ses tentatives de quiz, sans laisser de lignes orphelines.

## En pratique

Le module `sqlite3` de la bibliothèque standard de Python exécute les requêtes de la fiche sur une base en mémoire, puis montre une injection et l'effet d'un index :

```python
import sqlite3
con = sqlite3.connect(":memory:", isolation_level=None)  # pas de transaction implicite : BEGIN et ROLLBACK à la main
con.execute("PRAGMA foreign_keys = ON;")  # SQLite n'applique les clés étrangères que sur demande
con.executescript("""
CREATE TABLE etudiant (id INTEGER PRIMARY KEY, nom TEXT NOT NULL);
CREATE TABLE module (id INTEGER PRIMARY KEY, code TEXT NOT NULL UNIQUE);
CREATE TABLE note (
  etudiant_id INTEGER NOT NULL REFERENCES etudiant(id) ON DELETE CASCADE,
  module_id   INTEGER NOT NULL REFERENCES module(id) ON DELETE CASCADE,
  valeur      REAL NOT NULL CHECK (valeur BETWEEN 0 AND 20),
  PRIMARY KEY (etudiant_id, module_id)
);
""")
con.executemany("INSERT INTO etudiant VALUES (?, ?);", [(1, "Alice"), (2, "Bruno"), (3, "Chloé"), (4, "David")])
con.executemany("INSERT INTO module VALUES (?, ?);", [(1, "BDD"), (2, "WEB"), (3, "RES")])
con.executemany("INSERT INTO note VALUES (?, ?, ?);", [(1, 1, 15), (1, 2, 12), (1, 3, 9), (2, 1, 8), (2, 2, 11), (3, 1, 17), (3, 2, 14), (3, 3, 13)])
# 1. INNER JOIN : les notes d'au moins 12, avec le nom de l'étudiant et le code du module
jointure = """SELECT e.nom, m.code, n.valeur
FROM note n
INNER JOIN etudiant e ON e.id = n.etudiant_id
INNER JOIN module m ON m.id = n.module_id
WHERE n.valeur >= 12
ORDER BY e.nom, m.code;"""
print(con.execute(jointure).fetchall())
# [('Alice', 'BDD', 15.0), ('Alice', 'WEB', 12.0), ('Chloé', 'BDD', 17.0), ('Chloé', 'RES', 13.0), ('Chloé', 'WEB', 14.0)]
# 2. LEFT JOIN : David, sans aucune note, apparaît quand même
gauche = """SELECT e.nom, COUNT(n.valeur) AS nb_notes
FROM etudiant e
LEFT JOIN note n ON n.etudiant_id = e.id
GROUP BY e.id, e.nom
ORDER BY e.nom;"""
print(con.execute(gauche).fetchall())  # [('Alice', 3), ('Bruno', 2), ('Chloé', 3), ('David', 0)]
# 3. GROUP BY + HAVING : Bruno (moyenne 9.5) est écarté
moyennes = """SELECT e.nom, COUNT(*) AS nb_notes, ROUND(AVG(n.valeur), 2) AS moyenne
FROM etudiant e
INNER JOIN note n ON n.etudiant_id = e.id
GROUP BY e.id, e.nom
HAVING AVG(n.valeur) >= 10
ORDER BY moyenne DESC;"""
print(con.execute(moyennes).fetchall())  # [('Chloé', 3, 14.67), ('Alice', 3, 12.0)]
# 4. Transaction annulée : la cascade supprime les 3 notes d'Alice, puis ROLLBACK rétablit tout
con.execute("BEGIN;")
con.execute("DELETE FROM etudiant WHERE id = 1;")
print(con.execute("SELECT COUNT(*) FROM note;").fetchone())  # (5,)
con.execute("ROLLBACK;")
print(con.execute("SELECT COUNT(*) FROM note;").fetchone())  # (8,)
# 5. Injection : la saisie, collée dans le texte de la requête, en change le sens
saisie = "' OR '1'='1"
requete = "SELECT id, nom FROM etudiant WHERE nom = '" + saisie + "';"
print(requete)  # SELECT id, nom FROM etudiant WHERE nom = '' OR '1'='1';
print(con.execute(requete).fetchall())  # [(1, 'Alice'), (2, 'Bruno'), (3, 'Chloé'), (4, 'David')]
print(con.execute("SELECT id, nom FROM etudiant WHERE nom = ?;", (saisie,)).fetchall())  # [] : requête préparée
# 6. Plan d'exécution avant et après la création d'un index
recherche = "SELECT etudiant_id, valeur FROM note WHERE module_id = 2;"
print([ligne[3] for ligne in con.execute("EXPLAIN QUERY PLAN " + recherche)])  # ['SCAN note']
con.execute("CREATE INDEX idx_note_module ON note(module_id);")
print([ligne[3] for ligne in con.execute("EXPLAIN QUERY PLAN " + recherche)])
# ['SEARCH note USING INDEX idx_note_module (module_id=?)']
```

## À retenir

> - Association 1:N : clé étrangère du côté N ; association N:N : table d'association dont la clé primaire combine les deux clés étrangères.
> - Une clé étrangère garantit l'intégrité référentielle ; `ON DELETE CASCADE` supprime les lignes dépendantes avec la ligne référencée.
> - 1NF : valeurs atomiques ; 2NF : pas de dépendance partielle à la clé ; 3NF : pas de dépendance transitive entre attributs non clés.
> - `WHERE` filtre les lignes avant le regroupement, `HAVING` filtre les groupes après ; `LEFT JOIN` garde les lignes sans correspondance, avec des NULL.
> - Un index B-tree accélère les lectures sélectives mais ralentit les écritures ; l'ordre des colonnes d'un index composite compte.
> - ACID : atomicité, cohérence, isolation, durabilité ; seul SERIALIZABLE évite, selon la norme, lectures sales, non répétables et fantômes.
> - Jamais de concaténation de saisie dans une requête : des requêtes préparées. Le NoSQL (documents, clé-valeur) sert les schémas souples et l'accès par clé.
