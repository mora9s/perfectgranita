import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { useCallback } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { withHaptics } from '@/app/utils/press-feedback';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/app/hooks/use-recipes';
import { useFavorites } from '@/app/hooks/use-favorites';
import { useRecipeRatings } from '@/app/hooks/use-recipe-ratings';
import { useLanguage } from '@/app/language/language-context';
import { getLocalizedRecipeText } from '@/app/recipes/localization';
import { useTheme } from '@/app/theme/theme-context';
import type { Recipe } from '@/app/types/database';

function FavoriteCard({
  recipe,
  language,
  colors,
  resolvedTheme,
  onToggleFavorite,
  avgRating,
  votesCount,
}: {
  recipe: Recipe;
  language: 'fr' | 'en';
  colors: ReturnType<typeof useTheme>['colors'];
  resolvedTheme: ReturnType<typeof useTheme>['resolvedTheme'];
  onToggleFavorite: (id: string) => void;
  avgRating: number;
  votesCount: number;
}) {
  const recipeImageSource = recipe.media?.image ?? (recipe.media?.imageUrl ? { uri: recipe.media.imageUrl } : undefined);
  const hasImage = Boolean(recipeImageSource);
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
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            withHaptics(() => onToggleFavorite(recipe.id))();
          }}
          hitSlop={10}
          style={styles.favoriteButton}
        >
          <FontAwesome name="star" size={22} color={colors.primary} />
        </Pressable>

        <View style={styles.cardLayout}>
          <View
            style={[
              styles.visualWrap,
              {
                backgroundColor: hasImage ? colors.surfaceSoft : resolvedTheme === 'dark' ? '#2E2446' : '#F5F3FF',
                borderColor: colors.border,
              },
            ]}
          >
            {recipeImageSource ? (
              <Image source={recipeImageSource} style={styles.cardThumbnail} resizeMode="cover" />
            ) : (
              <ThemedText style={styles.visualFallback}>{recipe.emoji}</ThemedText>
            )}
          </View>

          <View style={styles.cardMainContent}>
            <ThemedText type="subtitle" style={styles.recipeName} numberOfLines={2}>
              {localizedName}
            </ThemedText>
            <ThemedText style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
              {localizedDescription}
            </ThemedText>

            {votesCount > 0 ? (
              <View style={styles.metaStack}>
                <ThemedText style={[styles.metaLine, { color: colors.textMuted }]} numberOfLines={1}>
                  ⭐ {avgRating.toFixed(1)} ({votesCount})
                </ThemedText>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function FavoritesScreen() {
  const { recipes, remoteRecipeIdSet } = useRecipes();
  const { favoriteRecipeIdSet, toggleFavorite } = useFavorites();
  const { colors, resolvedTheme } = useTheme();
  const { t, language } = useLanguage();

  const favoriteRecipes = recipes.filter((recipe) => favoriteRecipeIdSet.has(recipe.id));
  const { getRecipeStats, refreshRatings } = useRecipeRatings(
    favoriteRecipes.map((recipe) => ({
      recipeId: recipe.id,
      scope: remoteRecipeIdSet.has(recipe.id) ? 'remote' : 'local',
    }))
  );

  useFocusEffect(
    useCallback(() => {
      void refreshRatings();
    }, [refreshRatings])
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <ThemedText type="title" style={[styles.headerTitle, { color: colors.primary }]}>
          {t('favoritesTitle')}
        </ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          {t('favoritesSubtitle')}
        </ThemedText>
      </View>

      {favoriteRecipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyEmoji}>⭐</ThemedText>
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            {t('favoritesEmptyTitle')}
          </ThemedText>
          <ThemedText style={[styles.emptyDescription, { color: colors.textMuted }]}>
            {t('favoritesEmptyDescription')}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={favoriteRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const stats = getRecipeStats(item.id);
            return (
              <FavoriteCard
                recipe={item}
                language={language}
                colors={colors}
                resolvedTheme={resolvedTheme}
                onToggleFavorite={toggleFavorite}
                avgRating={stats.avgRating}
                votesCount={stats.votesCount}
              />
            );
          }}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  headerTitle: { marginBottom: 4 },
  headerSubtitle: { fontSize: 14 },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    borderRadius: 16,
    marginBottom: 12,
    padding: 0,
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
    padding: 12,
    gap: 10,
  },
  cardLayout: { flexDirection: 'row', gap: 12, alignItems: 'stretch' },
  visualWrap: {
    width: 92,
    height: 92,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cardThumbnail: { width: '100%', height: '100%' },
  visualFallback: { fontSize: 34 },
  cardMainContent: { flex: 1, justifyContent: 'space-between', minHeight: 92 },
  metaStack: { marginTop: 8, gap: 4 },
  metaRowCompact: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  metaLine: { fontSize: 12, lineHeight: 17, fontWeight: '600', flexShrink: 1 },
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
    padding: 6,
  },
  recipeName: { marginBottom: 6, paddingRight: 30 },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 10 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { textAlign: 'center', marginBottom: 8 },
  emptyDescription: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
