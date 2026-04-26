# 📋 BRIEFING - DevBack
## Mission: Données recettes et persistance locale Slushi Party

### Contexte projet
Slushi Party est une application Expo / React Native pour recettes **Ninja Slushi** et **Ninja Slushi Max**.

L'ancien nom était PerfectGranita. Le produit visible doit rester **Slushi Party**.

### État actuel
- Le catalogue source est `app/data/imported-cocktail-recipes.ts`.
- Les types sont dans `app/types/database.ts` et `app/types/machine.ts`.
- Les profils machine sont portés par `machineProfiles` sur chaque recette, pas par duplication de recettes.
- Les proportions/volumes par machine sont dans `ingredientItems[].volumesMl` et les helpers de `app/machine/scale.ts`.
- Les recettes personnalisées sont chargées via `useRecipes()` et persistées localement avec `expo-file-system`.

---

## 🎯 Mission DevBack

Maintenir la qualité des données recettes, la logique machine et la persistance locale-first.

### À vérifier / améliorer
- [ ] Chaque recette catalogue a un `id` stable et unique.
- [ ] Chaque recette a des textes FR cohérents et, si possible, des traductions EN dans `i18n`.
- [ ] Chaque recette catalogue contient un `machineProfiles.slushi` et un `machineProfiles['slushi-max']` pertinent.
- [ ] Les volumes `volumesMl` restent cohérents avec les capacités : Slushi 1.89L, Slushi Max 3.31L.
- [ ] Les recettes personnalisées ne remplacent jamais une recette catalogue avec le même id.
- [ ] Les payloads locaux corrompus sont signalés via `error` au lieu d'être supprimés silencieusement.
- [ ] Les écritures locales sont sérialisées pour éviter les pertes de données.

### Fichiers principaux
- `app/data/imported-cocktail-recipes.ts`
- `app/types/database.ts`
- `app/types/machine.ts`
- `app/machine/config.ts`
- `app/machine/scale.ts`
- `app/hooks/use-recipes.ts`
- `app/hooks/recipe-persistence.ts`
- `app/hooks/recipe-storage.ts`
- `tests/recipe-persistence.test.ts`

---

## ✅ Validation attendue
- [ ] `npm test`
- [ ] `npx tsc --noEmit`
- [ ] Test manuel : créer une recette perso, recharger l'app, vérifier qu'elle existe toujours.
- [ ] Test manuel : basculer Slushi / Slushi Max et vérifier volumes/programmes.

## Livrable
Un court compte-rendu indiquant les validations faites, les incohérences de données éventuelles et les corrections proposées ou appliquées.

*Architecte - Slushi Party Project*
