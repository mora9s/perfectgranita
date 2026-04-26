import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { withHaptics } from '@/app/utils/press-feedback';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/app/hooks/use-recipes';
import { useLanguage } from '@/app/language/language-context';
import { getLocalizedRecipeText } from '@/app/recipes/localization';
import { useTheme } from '@/app/theme/theme-context';
import type { Recipe } from '@/app/types/database';

function RecipeCard({
  recipe,
  language,
  colors,
  resolvedTheme,
}: {
  recipe: Recipe;
  language: 'fr' | 'en';
  colors: ReturnType<typeof useTheme>['colors'];
  resolvedTheme: ReturnType<typeof useTheme>['resolvedTheme'];
}) {
  const localizedName = getLocalizedRecipeText(recipe, language, 'name');
  const localizedDescription = getLocalizedRecipeText(recipe, language, 'description');

  return (
    <Pressable
      android_ripple={{ color: resolvedTheme === 'dark' ? 'rgba(216,204,255,0.28)' : 'rgba(109,40,217,0.22)' }}
      unstable_pressDelay={80}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, shadowColor: colors.shadow },
        pressed && [styles.cardPressed, { backgroundColor: resolvedTheme === 'dark' ? '#2A3F59' : '#E9DDFF' }],
      ]}
      onPress={withHaptics(() => router.push(`/recipe/${recipe.id}`))}
    >
      <View style={styles.cardContent}>
        <ThemedText style={styles.emoji}>{recipe.emoji}</ThemedText>
        <ThemedText type="subtitle" style={styles.recipeName}>
          {localizedName}
        </ThemedText>
        <ThemedText style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
          {localizedDescription}
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
  const { t } = useLanguage();

  return (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyEmoji}>📖</ThemedText>
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        {t('myRecipesEmptyTitle')}
      </ThemedText>
      <ThemedText style={[styles.emptyDescription, { color: colors.textMuted }]}> 
        {t('myRecipesEmptyDescription')}
      </ThemedText>
    </View>
  );
}

export default function MyRecipesScreen() {
  const { customRecipes } = useRecipes();
  const { colors, resolvedTheme } = useTheme();
  const { t, language } = useLanguage();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <ThemedText type="title" style={[styles.headerTitle, { color: colors.primary }]}> 
          {t('myRecipesTitle')}
        </ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: colors.textMuted }]}> 
          {t('myRecipesSubtitle')}
        </ThemedText>
      </View>

      {customRecipes.length === 0 ? (
        <EmptyState colors={colors} />
      ) : (
        <FlatList
          data={customRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecipeCard recipe={item} language={language} colors={colors} resolvedTheme={resolvedTheme} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        android_ripple={{ color: 'rgba(255,255,255,0.30)' }}
        style={({ pressed }) => [
          styles.createButton,
          { backgroundColor: colors.primary, shadowColor: colors.primary },
          pressed && styles.createButtonPressed,
        ]}
        onPress={withHaptics(() => router.push('/modal'))}
      >
        <ThemedText style={[styles.createButtonText, { color: colors.primaryText }]}> 
          {t('myRecipesCreateButton')}
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
  cardPressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.84,
    borderWidth: 1.2,
    shadowOpacity: 0.2,
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
  createButtonPressed: {
    transform: [{ scale: 0.92 }, { translateY: 1 }],
    opacity: 0.86,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
