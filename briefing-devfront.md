# 📋 BRIEFING - DevFront
## Mission: Écran "Mes Recettes" (My Recipes)

### Contexte Projet
PerfectGranita - Application Expo/React Native pour machine à granita
**Plan FR/EN:** Support multilingue FR/EN en cours d'implémentation

---

## 🎯 Ta Mission

Créer un nouvel onglet **"Mes Recettes"** dans la navigation par onglets.

---

## 📁 Fichiers à modifier/créer

### 1. Modifier `/app/(tabs)/_layout.tsx`
Ajouter un nouvel onglet "Mes Recettes" (my-recipes) avec:
- **Titre:** "Mes Recettes"
- **Icône:** `book.fill` (ou similaire)
- **Position:** après l'onglet "Explore"

### 2. Créer `/app/(tabs)/my-recipes.tsx`
Nouvel écran qui affiche:
- Header avec titre "📖 Mes Recettes"
- Liste des recettes personnalisées (`isCustom: true`)
- Message quand il n'y a pas de recettes personnalisées
- Bouton "+ Créer une recette" qui redirige vers `/modal`

---

## 🎨 Design Guidelines

Le design doit être **cohérent** avec l'écran `explore.tsx` existant:
- Même style de cartes
- Même palette de couleurs (violet #8B5CF6)
- Même typographie

### Structure suggérée pour my-recipes.tsx

```typescript
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/app/hooks/use-recipes';
import type { Recipe } from '@/app/types/database';

// Afficher uniquement les recettes où isCustom === true
// + bouton pour créer une nouvelle recette
```

### 3. Optionnel: Navigation depuis SlushiScreen
Dans `/app/slushi.tsx`, ajouter une troisième option "Mes Recettes" qui redirige vers l'onglet.

---

## ✅ Checklist de validation

- [ ] Onglet "Mes Recettes" présent dans la navigation
- [ ] Écran `/app/(tabs)/my-recipes.tsx` créé et fonctionnel
- [ ] Design cohérent avec le reste de l'application
- [ ] Navigation fonctionne correctement
- [ ] Gestion du cas vide (pas de recettes perso) implémentée

---

## 🔗 Dépendances
- Attendre que DevBack ait terminé (recette Mojito Frozen)

## 📤 Livrables
- `/app/(tabs)/_layout.tsx` modifié
- `/app/(tabs)/my-recipes.tsx` créé

---

**⚡ Action requise:** Confirme la réception de ce briefing. Attends le signal de l'Architecte pour commencer (après validation DevBack).

*Architecte - PerfectGranita Project*
