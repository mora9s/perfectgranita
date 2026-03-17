# 📋 BRIEFING - DevBack
## Mission: Ajout recette Mojito Frozen

### Contexte Projet
PerfectGranita - Application Expo/React Native pour machine à granita
**Plan FR/EN:** Support multilingue FR/EN en cours d'implémentation

---

## 🎯 Ta Mission

Ajouter la recette **"Mojito Frozen"** dans le fichier `/app/data/recipes/default-recipes.ts`

### Spécifications de la recette

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

---

## ✅ Checklist de validation

- [ ] Recette ajoutée dans `/app/data/recipes/default-recipes.ts`
- [ ] ID unique: `recipe-mojito-frozen`
- [ ] Tous les champs obligatoires présents (respecte le type `Recipe`)
- [ ] Fichier compile sans erreur TypeScript
- [ ] La fonction `getDefaultRecipesForMachine('slushi')` retourne la nouvelle recette

---

## 🔗 Dépendances
- Aucune - tu es le premier à intervenir

## 📤 Livrable
Fichier `/app/data/recipes/default-recipes.ts` modifié avec la nouvelle recette

---

**⚡ Action requise:** Confirme la réception de ce briefing et commence l'implémentation. Signale quand c'est terminé.

*Architecte - PerfectGranita Project*
