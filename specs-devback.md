# Spécifications - Ajout recette Mojito Frozen

## Contexte
Projet PerfectGranita - Application Expo/React Native pour machine à granita

## Tâche de devback

### 1. Ajouter la recette "Mojito Frozen" dans `/app/data/recipes/default-recipes.ts`

La recette doit suivre le type `Recipe` défini dans `/app/types/database.ts`:

```typescript
{
  id: 'recipe-mojito-frozen',
  name: 'Mojito Frozen',
  description: 'La version glacée et rafraîchissante du célèbre cocktail cubain, sans alcool.',
  machineId: 'slushi',
  category: 'classic', // ou 'fruity' selon ta préférence
  ingredients: [
    { name: 'Eau', quantity: 300, unit: 'ml' },
    { name: 'Sucre de canne', quantity: 80, unit: 'g' },
    { name: 'Jus de citron vert', quantity: 80, unit: 'ml' },
    { name: 'Feuilles de menthe fraîche', quantity: 15, unit: 'piece' },
    { name: 'Eau gazeuse', quantity: 200, unit: 'ml' },
  ],
  instructions: [
    'Dans un bol, écraser délicatement les feuilles de menthe avec le sucre pour libérer les arômes',
    'Ajouter le jus de citron vert et mélanger jusqu\'à dissolution du sucre',
    'Ajouter l\'eau et l\'eau gazeuse, mélanger doucement',
    'Filtrer pour retirer les feuilles de menthe si désiré',
    'Verser dans le réservoir de la machine et lancer le cycle',
  ],
  prepTimeMinutes: 15,
  freezeTimeHours: 24,
  difficulty: 'medium',
  isCustom: false,
  isFavorite: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
```

### 2. Vérifier que la recette est bien exportée
La fonction `getDefaultRecipesForMachine('slushi')` doit retourner la nouvelle recette.

### 3. Tests à effectuer
- Vérifier que le fichier compile sans erreur TypeScript
- Vérifier que la recette a un ID unique
- Vérifier que tous les champs obligatoires sont présents

## Livrable
- Fichier `/app/data/recipes/default-recipes.ts` modifié avec la nouvelle recette
