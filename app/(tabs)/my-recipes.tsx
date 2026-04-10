import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/app/hooks/use-recipes';
import { useTheme } from '@/app/theme/theme-context';
import type { Recipe } from '@/app/types/database';

function RecipeCard({
  recipe,
  colors,
  resolvedTheme,
}: {
  recipe: Recipe;
  colors: ReturnType<typeof useTheme>['colors'];
  resolvedTheme: ReturnType<typeof useTheme>['resolvedTheme'];
}) {
  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
    >
      <View style={styles.cardContent}>
        <ThemedText style={styles.emoji}>{recipe.emoji}</ThemedText>
        <ThemedText type="subtitle" style={styles.recipeName}>
          {recipe.name}
        </ThemedText>
        <ThemedText style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
          {recipe.description}
        </ThemedText>
        <View style={styles.timeContainer}>
          <ThemedText style={[styles.timeText, { color: resolvedTheme === 'dark' ? '#C4B5FD' : colors.primary }]}>
            ⏱️ {recipe.time.total}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

function EmptyState({ colors }: { colors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyEmoji}>📖</ThemedText>
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        Aucune recette personnalisée
      </ThemedText>
      <ThemedText style={[styles.emptyDescription, { color: colors.textMuted }]}>
        Créez votre première recette de granita personnalisée !
      </ThemedText>
    </View>
  );
}

export default function MyRecipesScreen() {
  const { customRecipes } = useRecipes();
  const { colors, resolvedTheme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <ThemedText type="title" style={[styles.headerTitle, { color: colors.primary }]}>
          📖 Mes Recettes
        </ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          Vos créations personnalisées
        </ThemedText>
      </View>

      {customRecipes.length === 0 ? (
        <EmptyState colors={colors} />
      ) : (
        <FlatList
          data={customRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecipeCard recipe={item} colors={colors} resolvedTheme={resolvedTheme} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        style={[styles.createButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        onPress={() => router.push('/modal')}
      >
        <ThemedText style={[styles.createButtonText, { color: colors.primaryText }]}>
          + Créer une recette
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 20,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  recipeName: {
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  createButton: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
