import { Pressable, StyleSheet, ScrollView, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/app/hooks/use-recipes';
import type { Recipe } from '@/app/types/database';

interface RecipeDetailProps {
  recipe: Recipe;
}

function RecipeDetail({ recipe }: RecipeDetailProps) {
  return (
    <ScrollView contentContainerStyle={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <ThemedText style={styles.detailEmoji}>{recipe.emoji}</ThemedText>
        <ThemedText type="title" style={styles.detailTitle}>
          {recipe.name}
        </ThemedText>
        <ThemedText style={styles.detailDescription}>
          {recipe.description}
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          📋 INGRÉDIENTS
        </ThemedText>
        {recipe.ingredients.map((item, index) => (
          <ThemedText key={index} style={styles.listItem}>
            • {item}
          </ThemedText>
        ))}
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          ⚖️ PROPORTIONS
        </ThemedText>
        {Object.entries(recipe.proportions).map(([key, value]) => (
          <ThemedText key={key} style={styles.listItem}>
            {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
          </ThemedText>
        ))}
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          📝 INSTRUCTIONS
        </ThemedText>
        {recipe.instructions.map((item, index) => (
          <ThemedText key={index} style={styles.listItem}>
            {index + 1}. {item}
          </ThemedText>
        ))}
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          ⏱️ TEMPS
        </ThemedText>
        {Object.entries(recipe.time).map(([key, value]) => (
          <ThemedText key={key} style={styles.listItem}>
            {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
          </ThemedText>
        ))}
      </View>
    </ScrollView>
  );
}

export default function RecipeScreen() {
  const { recipes } = useRecipes();
  const { id } = router.useSearchParams();

  const recipe = recipes.find(r => r.id === id);

  if (!recipe) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <ThemedText type="title" style={styles.errorTitle}>Recette introuvable</ThemedText>
          <ThemedText style={styles.errorDescription}>
            La recette que vous recherchez n'existe pas.
          </ThemedText>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ThemedText style={styles.backButtonText}>Retour</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
          title: recipe.name,
        }}
      />
      <View style={styles.backHeader}>
        <Pressable onPress={() => router.back()} style={styles.backButtonTop}>
          <ThemedText style={styles.backButtonTopText}>←</ThemedText>
        </Jpressable>
      </View>
      <RecipeDetail recipe={recipe} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  backHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingHorizontal: 20,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  backButtonTop: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  backButtonTopText: {
    fontSize: 20,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  detailContainer: {
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 40,
  },
  detailHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  detailEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  detailTitle: {
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  detailDescription: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    color: '#8B5CF6',
    marginBottom: 15,
  },
  listItem: {
    fontSize: 16,
    color: '#1C1C1E',
    marginBottom: 8,
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    color: '#FF3B30',
    marginBottom: 10,
  },
  errorDescription: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
