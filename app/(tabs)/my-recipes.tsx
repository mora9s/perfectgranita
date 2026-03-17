import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/app/hooks/use-recipes';
import type { Recipe } from '@/app/types/database';

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
    >
      <View style={styles.cardContent}>
        <ThemedText style={styles.emoji}>{recipe.emoji}</ThemedText>
        <ThemedText type="subtitle" style={styles.recipeName}>
          {recipe.name}
        </ThemedText>
        <ThemedText style={styles.description} numberOfLines={2}>
          {recipe.description}
        </ThemedText>
        <View style={styles.timeContainer}>
          <ThemedText style={styles.timeText}>⏱️ {recipe.time.total}</ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyEmoji}>📖</ThemedText>
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        Aucune recette personnalisée
      </ThemedText>
      <ThemedText style={styles.emptyDescription}>
        Créez votre première recette de granita personnalisée !
      </ThemedText>
    </View>
  );
}

export default function MyRecipesScreen() {
  const { customRecipes } = useRecipes();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          📖 Mes Recettes
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Vos créations personnalisées
        </ThemedText>
      </View>

      {customRecipes.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={customRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecipeCard recipe={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        style={styles.createButton}
        onPress={() => router.push('/modal')}
      >
        <ThemedText style={styles.createButtonText}>
          + Créer une recette
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    color: '#8B5CF6',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
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
    color: '#1C1C1E',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#8B5CF6',
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
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  createButton: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
