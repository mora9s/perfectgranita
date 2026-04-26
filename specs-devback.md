# Spécifications DevBack - Slushi Party

## Contexte
Slushi Party utilise un catalogue de recettes cocktail/slush adapté aux machines **Ninja Slushi** et **Ninja Slushi Max**.

## Objectif
Garantir la qualité des données recettes, la cohérence des profils machine et la persistance locale des recettes personnalisées.

## Catalogue recettes
Source principale : `app/data/imported-cocktail-recipes.ts`.

Chaque recette catalogue doit :
- avoir un `id` stable et unique ;
- avoir `isCustom: false` ;
- inclure nom, emoji, description, ingrédients, instructions, proportions, temps ;
- définir les profils machine pertinents dans `machineProfiles` ;
- utiliser `ingredientItems[].volumesMl` quand les volumes diffèrent par machine ;
- ne pas dupliquer une recette uniquement pour Slushi / Slushi Max.

## Profils machine
Machines supportées :
- `slushi` : Ninja Slushi, capacité cible 1.89L ;
- `slushi-max` : Ninja Slushi Max, capacité cible 3.31L.

Les volumes, programmes, temps et ABV estimés doivent rester compatibles avec les contraintes machine.

## Recettes personnalisées
Source runtime : `useRecipes()`.

Exigences :
- chargement local au démarrage ;
- merge avec les recettes catalogue ;
- pas de remplacement d'une recette catalogue par une recette personnalisée au même id ;
- persistance locale sur ajout/suppression ;
- écritures sérialisées pour éviter les races ;
- payload local corrompu signalé via `error` ;
- consommateurs existants compatibles même s'ils ignorent `isLoading` / `error`.

## Tests
- `tests/recipe-persistence.test.ts` couvre parsing, filtrage et merge.
- Ajouter des tests si une nouvelle règle de persistance ou de merge est introduite.

## Validation
- `npm test`
- `npx tsc --noEmit`
- Test manuel : création recette personnalisée → reload → recette toujours présente.
- Test manuel : bascule Slushi / Slushi Max → volumes et programmes changent.

## Livrables
- Changements de données/logique ciblés.
- Compte-rendu des validations et risques restants.
