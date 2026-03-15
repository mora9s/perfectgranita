# Spécifications - Ajout recette Mojito Frozen

## Contexte
Projet PerfectGranita - Application Expo/React Native pour machine à granita

## Tâche de devfront

### 1. Ajouter l'écran "Mes Recettes" (My Recipes)

Créer un nouvel onglet "Mes Recettes" dans la navigation par onglets.

### 2. Modifications à effectuer

#### A. Modifier `/app/(tabs)/_layout.tsx`
Ajouter un nouvel onglet "Mes Recettes" (my-recipes) avec:
- Titre: "Mes Recettes"
- Icône: `book.fill` (ou similaire)
- Position: après l'onglet "Explore"

#### B. Créer `/app/(tabs)/my-recipes.tsx`
Créer un nouvel écran qui affiche:
- Un header avec titre "📖 Mes Recettes"
- La liste des recettes personnalisées (isCustom: true)
- Un message quand il n'y a pas de recettes personnalisées
- Un bouton "+ Créer une recette" qui redirige vers `/modal`

Le design doit être cohérent avec l'écran explore.tsx existant:
- Même style de cartes
- Même palette de couleurs (violet #8B5CF6)
- Même typographie

#### C. Optionnel: Ajouter une navigation depuis SlushiScreen
Dans `/app/slushi.tsx`, ajouter une troisième option "Mes Recettes" qui redirige vers l'onglet.

### 3. Structure du fichier my-recipes.tsx

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

### 4. Tests à effectuer
- Vérifier que la navigation fonctionne
- Vérifier que le design est cohérent
- Vérifier que l'affichage fonctionne avec/sans recettes personnalisées

## Livrables
- `/app/(tabs)/_layout.tsx` modifié
- `/app/(tabs)/my-recipes.tsx` créé
