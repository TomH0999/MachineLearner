# Programmation et POO : mémoire, objets, patrons de conception

Cette fiche couvre ce qu'on attend d'un développeur en sortie de BUT : savoir où vivent les données en mémoire, structurer un programme en objets et organiser le code pour qu'il reste facile à faire évoluer. Elle se termine par les bases de la programmation fonctionnelle, de plus en plus présente en Java comme en Python.

## Mémoire en C et C++

Un programme C range ses données dans deux zones principales :

- la **pile** (stack) contient les variables locales et les paramètres. Chaque appel de fonction y empile un cadre, qui disparaît automatiquement au retour ;
- le **tas** (heap) contient les blocs alloués à la demande avec `malloc` (ou `new` en C++). Ils vivent jusqu'à ce qu'on les libère explicitement avec `free` (ou `delete`) : le C n'a pas de ramasse-miettes.

Un pointeur est une variable qui contient une adresse. L'**arithmétique de pointeurs** compte en éléments, pas en octets : si `p` pointe sur un `int`, `p + 2` avance de `2 * sizeof(int)` octets, et `*(p + 2)` équivaut à `p[2]`.

```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 5;
    /* 1. Allocation sur le tas : n entiers contigus */
    int *tab = malloc(n * sizeof *tab);
    if (tab == NULL) {                /* malloc peut échouer : toujours tester */
        fprintf(stderr, "Allocation impossible\n");
        return EXIT_FAILURE;
    }

    /* 2. Utilisation : tab[i] équivaut à *(tab + i) */
    for (int i = 0; i < n; i++)
        tab[i] = i * i;
    for (int i = 0; i < n; i++)
        printf("%d ", *(tab + i));    /* affiche "0 1 4 9 16 " */
    printf("\n");

    /* 3. Libération : un free pour chaque malloc */
    free(tab);
    tab = NULL;                       /* évite de garder un pointeur pendant */
    return EXIT_SUCCESS;
}
```

Trois erreurs classiques :

- **pointeur nul** : `NULL` (ou `nullptr` en C++) ne désigne rien. On le teste avant de déréférencer ;
- **pointeur pendant** (dangling) : il pointe vers une zone déjà libérée, ou vers une variable locale d'une fonction terminée. `free(p)` ne modifie pas `p`, donc le déréférencer ensuite est un comportement indéfini ;
- **fuite mémoire** : un bloc du tas n'est plus accessible par aucun pointeur, mais n'a pas été libéré. Les fuites s'accumulent jusqu'à épuiser la mémoire d'un programme qui tourne longtemps.

En C++, une **référence** (`int& r = x;`) est un alias de `x` : elle doit être initialisée, ne peut pas être nulle et ne change jamais de cible. On l'utilise sans `*`, ce qui la rend plus sûre qu'un pointeur pour passer un argument modifiable.

## Programmation orientée objet

L'**encapsulation** cache l'état interne d'un objet : les attributs sont `private` et l'extérieur passe par des méthodes publiques qui garantissent la cohérence des données. En Java, `protected` ouvre l'accès aux sous-classes et au paquetage, et l'absence de mot-clé le limite au paquetage.

L'**héritage** (`extends`) permet à une sous-classe de réutiliser et de spécialiser une classe mère. Le **polymorphisme** en découle : une variable de type `Forme` peut désigner un `Cercle` ou un `Rectangle`, et c'est le type réel de l'objet qui choisit la méthode exécutée (**liaison dynamique**). En C++, cette liaison dynamique n'a lieu que pour les méthodes déclarées `virtual`.

```java
abstract class Forme {
    private final String nom;                // encapsulé : visible seulement dans Forme
    protected Forme(String nom) { this.nom = nom; }

    public abstract double aire();           // pas de corps : chaque sous-classe le fournit
    public String decrire() {                // méthode concrète, héritée telle quelle
        return nom + " d'aire " + aire();    // appel polymorphe
    }
}

class Cercle extends Forme {
    private final double rayon;
    Cercle(double rayon) { super("Cercle"); this.rayon = rayon; }
    @Override
    public double aire() { return Math.PI * rayon * rayon; }
}

class Rectangle extends Forme {
    private final double largeur, hauteur;
    Rectangle(double l, double h) { super("Rectangle"); largeur = l; hauteur = h; }
    @Override
    public double aire() { return largeur * hauteur; }
}

public class Demo {
    public static void main(String[] args) {
        Forme[] formes = { new Cercle(1.0), new Rectangle(2.0, 3.0) };
        for (Forme f : formes)
            System.out.println(f.decrire());
        // Cercle d'aire 3.141592653589793
        // Rectangle d'aire 6.0
    }
}
```

Une **classe abstraite** comme `Forme` ne s'instancie pas, mais peut porter des attributs, un constructeur et des méthodes concrètes ; une classe n'hérite que d'une seule classe. Une **interface** décrit seulement un contrat, sans état d'instance, et une classe peut en implémenter plusieurs.

| | Surcharge (overloading) | Redéfinition (overriding) |
|---|---|---|
| Où ? | Dans une même classe | Dans une sous-classe |
| Signature | Même nom, paramètres différents | Même nom, mêmes paramètres |
| Version choisie | À la compilation, selon le type des arguments | À l'exécution, selon le type réel de l'objet |
| En Java | Aucune annotation | `@Override` (recommandée) |
| Exemple | `somme(int, int)` et `somme(double, double)` | `aire()` dans `Cercle` et `Rectangle` |

## Principes SOLID et patrons de conception

Les principes **SOLID** guident le découpage des classes :

- **S**, responsabilité unique : une classe n'a qu'une seule raison de changer ;
- **O**, ouvert/fermé : on ajoute un comportement en écrivant une nouvelle classe, pas en modifiant le code existant ;
- **L**, substitution de Liskov : une sous-classe doit pouvoir remplacer sa classe mère sans casser le programme ;
- **I**, ségrégation des interfaces : plusieurs petites interfaces ciblées plutôt qu'une interface géante ;
- **D**, inversion des dépendances : dépendre d'abstractions (interfaces), pas d'implémentations concrètes.

Les **patrons de conception** sont des solutions éprouvées à des problèmes récurrents :

| Patron | Famille | Rôle |
|---|---|---|
| Singleton | Création | Garantir une seule instance, accessible globalement |
| Factory | Création | Centraliser le choix de la classe concrète à instancier |
| Observer | Comportement | Prévenir automatiquement des abonnés quand un sujet change |
| Strategy | Comportement | Rendre un algorithme interchangeable derrière une interface |

Strategy est l'application directe du principe ouvert/fermé : remplacer un `switch` sur le type de paiement par une interface `MoyenPaiement` permet d'ajouter un moyen de paiement sans toucher à la classe `Commande`. Le Singleton, lui, est à utiliser avec parcimonie : c'est un état global qui complique les tests.

## Programmation fonctionnelle

La programmation fonctionnelle construit un programme à partir de fonctions qui transforment des données au lieu de les modifier :

- une **fonction pure** renvoie toujours le même résultat pour les mêmes arguments et n'a aucun effet de bord (pas d'affichage, pas de variable globale modifiée) ;
- l'**immutabilité** interdit de modifier une donnée après sa création : on en produit une nouvelle version (`tuple` en Python, `record` ou `List.of` en Java) ;
- une **lambda** est une fonction anonyme, passée en argument à une autre fonction : `lambda x: x * 2` en Python, `x -> x * 2` en Java.

Le trio `map` / `filter` / `reduce` remplace la plupart des boucles qui transforment une collection (en Java, via les streams : `notes.stream().filter(n -> n >= 10).toList()`) :

```python
from functools import reduce

notes = [12, 7, 15, 9, 18]

# map applique une fonction à chaque élément
bonus = list(map(lambda n: min(n + 2, 20), notes))
print(bonus)    # [14, 9, 17, 11, 20]

# filter garde les éléments pour lesquels le prédicat est vrai
admis = list(filter(lambda n: n >= 10, notes))
print(admis)    # [12, 15, 18]

# reduce combine les éléments un à un avec un accumulateur (ici, valeur initiale 0)
total = reduce(lambda acc, n: acc + n, notes, 0)
print(total)    # 61

# notes n'a pas été modifiée : chaque étape a produit une nouvelle valeur
print(notes)    # [12, 7, 15, 9, 18]
```

## À retenir

> - Variables locales sur la pile (libérées automatiquement) ; blocs `malloc` sur le tas, libérés par un `free` et un seul.
> - `p + k` avance de `k` éléments ; après `free(p)`, affecter `NULL` à `p` pour éviter un pointeur pendant.
> - Encapsulation, héritage, polymorphisme : c'est le type réel de l'objet qui choisit la méthode redéfinie.
> - Surcharge = même nom, paramètres différents (compilation) ; redéfinition = même signature dans une sous-classe (exécution).
> - SOLID et les patrons visent le même but : ajouter une fonctionnalité sans modifier le code qui marche déjà.
> - Fonctions pures, données immuables et `map` / `filter` / `reduce` rendent le code plus prévisible et plus facile à tester.
