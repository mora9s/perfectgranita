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

export default function ExploreScreen() {
  const { recipes } = useRecipes();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          🔍 Explorer
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Découvrez nos recettes de granita
        </ThemedText>
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
    paddingBottom: 24,
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
});
