# Spécifications - Vérification Intégration

## Contexte
Projet PerfectGranita - Application Expo/React Native pour machine à granita

## Tâche de l'intégrateur

### 1. Vérifier le travail de devback
- [ ] La recette Mojito Frozen est présente dans `/app/data/recipes/default-recipes.ts`
- [ ] L'ID est unique (`recipe-mojito-frozen`)
- [ ] Tous les champs obligatoires sont présents
- [ ] Le fichier compile sans erreur TypeScript
- [ ] La recette apparaît dans la liste des cocktails (écran Explore)

### 2. Vérifier le travail de devfront
- [ ] L'onglet "Mes Recettes" est présent dans la navigation
- [ ] L'écran `/app/(tabs)/my-recipes.tsx` existe et s'affiche
- [ ] Le design est cohérent avec le reste de l'application
- [ ] La navigation fonctionne correctement
- [ ] L'écran gère bien les cas vides (pas de recettes perso)

### 3. Vérification globale
- [ ] L'application compile (`npx tsc --noEmit`)
- [ ] Aucune erreur de lint
- [ ] Les tests manuels passent (navigation, affichage)

### 4. Rapport attendu
Fournir un compte-rendu avec:
- Statut de chaque vérification (OK/KO)
- Problèmes éventuels trouvés
- Recommandations si besoin

## Livrable
- Rapport de vérification détaillé
