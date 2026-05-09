import { FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getMarkedPressStyle, withHaptics } from '@/app/utils/press-feedback';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/app/hooks/use-recipes';
import { useFavorites } from '@/app/hooks/use-favorites';
import { useRecipeRatings } from '@/app/hooks/use-recipe-ratings';
import { MACHINE_OPTIONS } from '@/app/machine/config';
import { useLanguage } from '@/app/language/language-context';
import { getLocalizedRecipeText } from '@/app/recipes/localization';
import { useMachine } from '@/app/machine/machine-context';
import { useTheme } from '@/app/theme/theme-context';
import type { Recipe, RecipeAlcoholCategory } from '@/app/types/database';
import type { MachineId } from '@/app/types/machine';

type MoninFilter = 'all' | 'monin' | 'non-monin';
type DrinkTypeFilter = 'all' | 'cocktailAlcool' | 'cocktailSans' | 'autre';
type OptionalDrinkTypeFilter = Exclude<DrinkTypeFilter, 'all'>;

interface RecipeCardProps {
  recipe: Recipe;
  machineId: MachineId;
  language: 'fr' | 'en';
  colors: ReturnType<typeof useTheme>['colors'];
  resolvedTheme: ReturnType<typeof useTheme>['resolvedTheme'];
  isFavorite: boolean;
  onToggleFavorite: (recipeId: string) => void;
  avgRating: number;
  votesCount: number;
}

function RecipeCard({
  recipe,
  machineId,
  language,
  colors,
  resolvedTheme,
  isFavorite,
  onToggleFavorite,
  avgRating,
  votesCount,
}: RecipeCardProps) {
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
          pressed && [
            styles.cardPressed,
            getMarkedPressStyle(true, { scale: 0.9, opacity: 0.84 }),
            { backgroundColor: resolvedTheme === 'dark' ? '#2A3F59' : '#E9DDFF' },
          ],
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
          <FontAwesome name={isFavorite ? 'star' : 'star-o'} size={20} color={isFavorite ? colors.primary : colors.textMuted} />
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

function isRecipeDrinkType(value: unknown): value is OptionalDrinkTypeFilter {
  return value === 'cocktailAlcool' || value === 'cocktailSans' || value === 'autre';
}

function getDrinkType(recipe: Recipe): DrinkTypeFilter {
  const withOptionalDrinkType = recipe as Recipe & { drinkCategory?: unknown };
  if (isRecipeDrinkType(withOptionalDrinkType.drinkCategory)) {
    return withOptionalDrinkType.drinkCategory;
  }

  return recipe.alcoholCategory ? 'cocktailAlcool' : 'autre';
}

export default function ExploreScreen() {
  const { recipes, remoteRecipeIdSet } = useRecipes();
  const { favoriteRecipeIdSet, toggleFavorite } = useFavorites();
  const { machinePreferenceMode, selectedMachine, selectedMachineId, setSelectedMachineId } = useMachine();
  const { colors, resolvedTheme } = useTheme();
  const { t, language } = useLanguage();
  const [activeDrinkType, setActiveDrinkType] = useState<DrinkTypeFilter>('all');
  const [activeAlcohol, setActiveAlcohol] = useState<RecipeAlcoholCategory | 'all'>('all');
  const [activeMonin, setActiveMonin] = useState<MoninFilter>('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
    if (activeDrinkType !== 'cocktailAlcool' && activeAlcohol !== 'all') {
      setActiveAlcohol('all');
    }
  }, [activeDrinkType, activeAlcohol]);

  const alcoholLabels: Record<RecipeAlcoholCategory, string> = {
    tequila: t('alcoholTequila'),
    rhum: t('alcoholRhum'),
    vodka: t('alcoholVodka'),
    gin: t('alcoholGin'),
    'aperol-prosecco': t('alcoholSpritz'),
    vin: t('alcoholWine'),
    mixte: t('alcoholMixed'),
    autre: t('alcoholOther'),
  };

  const alcoholOptions = useMemo(() => {
    return Array.from(
      new Set(
        recipes
          .filter((recipe) => getDrinkType(recipe) === 'cocktailAlcool')
          .map((recipe) => recipe.alcoholCategory)
          .filter(Boolean)
      )
    ) as RecipeAlcoholCategory[];
  }, [recipes]);

  const drinkTypeOptions: Array<{ key: DrinkTypeFilter; label: string }> = [
    { key: 'all', label: t('exploreDrinkTypeAll') },
    { key: 'cocktailAlcool', label: t('exploreDrinkTypeAlcoholicCocktail') },
    { key: 'cocktailSans', label: t('exploreDrinkTypeNonAlcoholicCocktail') },
    { key: 'autre', label: t('exploreDrinkTypeOther') },
  ];

  const moninOptions: Array<{ key: MoninFilter; label: string }> = [
    { key: 'all', label: t('exploreAll') },
    { key: 'monin', label: t('exploreMoninLabel') },
    { key: 'non-monin', label: t('exploreWithoutMonin') },
  ];

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const drinkTypeMatch = activeDrinkType === 'all' ? true : getDrinkType(recipe) === activeDrinkType;
      const alcoholMatch =
        activeDrinkType !== 'cocktailAlcool' || activeAlcohol === 'all' || recipe.alcoholCategory === activeAlcohol;
      const moninMatch =
        activeMonin === 'all' ||
        (activeMonin === 'monin' && recipe.usesMonin === true) ||
        (activeMonin === 'non-monin' && recipe.usesMonin !== true);

      return drinkTypeMatch && alcoholMatch && moninMatch;
    });
  }, [activeDrinkType, activeAlcohol, activeMonin, recipes]);

  const { getRecipeStats, refreshRatings } = useRecipeRatings(
    filteredRecipes.map((recipe) => ({
      recipeId: recipe.id,
      scope: remoteRecipeIdSet.has(recipe.id) ? 'remote' : 'local',
    }))
  );

  useFocusEffect(
    useCallback(() => {
      void refreshRatings();
    }, [refreshRatings])
  );

  const filtersActive = activeDrinkType !== 'all' || activeAlcohol !== 'all' || activeMonin !== 'all';

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];

    if (activeDrinkType !== 'all') {
      const drinkTypeLabel = drinkTypeOptions.find((option) => option.key === activeDrinkType)?.label;
      if (drinkTypeLabel) {
        labels.push(drinkTypeLabel);
      }
    }

    if (activeDrinkType === 'cocktailAlcool' && activeAlcohol !== 'all') {
      labels.push(alcoholLabels[activeAlcohol]);
    }

    if (activeMonin !== 'all') {
      const moninLabel = moninOptions.find((option) => option.key === activeMonin)?.label;
      if (moninLabel) {
        labels.push(moninLabel);
      }
    }

    return labels;
  }, [activeDrinkType, activeAlcohol, activeMonin, alcoholLabels, drinkTypeOptions, moninOptions]);

  const compactFilterChips = useMemo(() => {
    const maxShownChips = 2;
    const overflowCount = Math.max(0, activeFilterLabels.length - maxShownChips);

    return {
      labels: activeFilterLabels.slice(0, maxShownChips),
      overflowCount,
    };
  }, [activeFilterLabels]);

  const handleResetFilters = () => {
    setActiveDrinkType('all');
    setActiveAlcohol('all');
    setActiveMonin('all');
  };

  const handleCloseFilters = () => {
    setIsFilterModalOpen(false);
  };

  const handleOpenFilters = () => {
    setIsFilterModalOpen(true);
  };

  const showMachineSwitcher = false;

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.surface, shadowColor: colors.shadow }] }>
        <ThemedText type="title" style={[styles.headerTitle, { color: colors.primary }]}> 
          {t('exploreTitle')}
        </ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: colors.textMuted }]}> 
          {t('exploreSubtitle')} {selectedMachine.name}
        </ThemedText>

        {showMachineSwitcher ? (
          <View style={styles.machineSwitcher}>
            {MACHINE_OPTIONS.map((machine) => {
              const isSelected = machine.id === selectedMachineId;

              return (
                <Pressable
                  key={machine.id}
                  android_ripple={{ color: resolvedTheme === 'dark' ? 'rgba(216,204,255,0.30)' : 'rgba(109,40,217,0.22)' }}
                  style={({ pressed }) => [
                    styles.switcherButton,
                    {
                      backgroundColor: resolvedTheme === 'dark' ? '#2E2446' : '#F5F3FF',
                      borderColor: resolvedTheme === 'dark' ? '#4A3E66' : '#DDD6FE',
                    },
                    isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                    pressed && [styles.compactPressablePressed, getMarkedPressStyle(true, { scale: 0.92, opacity: 0.84 })],
                  ]}
                  onPress={withHaptics(() => setSelectedMachineId(machine.id))}
                >
                  <ThemedText
                    style={[
                      styles.switcherText,
                      { color: resolvedTheme === 'dark' ? '#D8CCFF' : '#6D28D9' },
                      isSelected && { color: colors.primaryText },
                    ]}
                  >
                    {machine.shortName}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={styles.filtersSection}>
          <View style={styles.filtersHeaderRow}>
            <Pressable
              android_ripple={{ color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.14)' }}
              style={({ pressed }) => [
                styles.filtersToggle,
                pressed && [styles.inlinePressablePressed, getMarkedPressStyle(true, { scale: 0.95, opacity: 0.88 })],
              ]}
              onPress={withHaptics(handleOpenFilters)}
            >
              <ThemedText type="defaultSemiBold">{t('exploreFiltersTitle')}</ThemedText>
              <ThemedText style={[styles.filtersToggleIcon, { color: colors.textMuted }]}>▾</ThemedText>
            </Pressable>

            <View style={styles.filtersCollapsedSection}>
              {filtersActive ? (
                <View style={styles.activeFiltersRow}>
                  {compactFilterChips.labels.map((label) => (
                    <View
                      key={label}
                      style={[styles.activeFilterChip, { borderColor: colors.primary, backgroundColor: colors.primary + '1E' }]}
                    >
                      <ThemedText style={[styles.activeFilterChipText, { color: colors.primary }]}>{label}</ThemedText>
                    </View>
                  ))}
                  {compactFilterChips.overflowCount > 0 ? (
                    <View
                      style={[
                        styles.activeFilterChip,
                        styles.activeFilterChipCompact,
                        { borderColor: colors.primary, backgroundColor: colors.primary + '1E' },
                      ]}
                    >
                      <ThemedText style={[styles.activeFilterChipText, { color: colors.primary }]}>+{compactFilterChips.overflowCount}</ThemedText>
                    </View>
                  ) : null}
                </View>
              ) : (
                <ThemedText
                  style={[styles.filtersCollapsedHint, { color: colors.textMuted }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {t('exploreFiltersCollapsedHint')}
                </ThemedText>
              )}
            </View>

            {filtersActive ? (
              <Pressable
                android_ripple={{ color: colors.primary + '3A' }}
                style={({ pressed }) => [
                  styles.resetButton,
                  { borderColor: colors.primary, backgroundColor: colors.primary + '12' },
                  pressed && [styles.compactPressablePressed, getMarkedPressStyle(true, { scale: 0.92, opacity: 0.84 })],
                ]}
                onPress={withHaptics(handleResetFilters)}
              >
                <ThemedText style={[styles.resetButtonText, { color: colors.primary }]}>{t('exploreReset')}</ThemedText>
              </Pressable>
            ) : null}
          </View>
        </View>
        <Modal
          animationType="slide"
          transparent
          visible={isFilterModalOpen}
          onRequestClose={handleCloseFilters}
        >
          <View style={styles.filterModalBackdrop}>
            <Pressable
              style={[styles.filterModalBackdropPress, { backgroundColor: '#00000044' }]}
              onPress={withHaptics(handleCloseFilters)}
            />
            <View
              style={[
                styles.filterModal,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={[styles.filterModalHeader, { borderBottomColor: colors.border }]}> 
                <View style={[styles.filterModalHandle, { backgroundColor: colors.textMuted + '40' }]} />
                <View style={styles.filterModalHeaderRow}>
                  <ThemedText type="defaultSemiBold">{t('exploreFiltersTitle')}</ThemedText>
                  <Pressable
                    android_ripple={{ color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.14)' }}
                    style={({ pressed }) => [
                      pressed && [styles.inlinePressablePressed, getMarkedPressStyle(true, { scale: 0.95, opacity: 0.88 })],
                    ]}
                    onPress={withHaptics(handleCloseFilters)}
                  >
                    <ThemedText style={[styles.filterModalClose, { color: colors.textMuted }]}>✕</ThemedText>
                  </Pressable>
                </View>
              </View>

              <ScrollView
                style={styles.filterModalBody}
                contentContainerStyle={styles.filterModalBodyContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={[styles.filterPanel, { borderColor: colors.border, backgroundColor: colors.surfaceSoft }]}> 
                  <View style={styles.filterGroup}>
                    <ThemedText style={[styles.filterLabel, { color: colors.textMuted }]}>{t('exploreDrinkTypeLabel')}</ThemedText>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.filterChipsRow}
                    >
                      {drinkTypeOptions.map((option) => {
                        const selected = activeDrinkType === option.key;
                        return (
                          <Pressable
                            key={option.key}
                            android_ripple={{ color: selected ? 'rgba(255,255,255,0.24)' : colors.primary + '32' }}
                            style={({ pressed }) => [
                              styles.filterChip,
                              { backgroundColor: colors.surfaceSoft, borderColor: colors.border },
                              selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                              pressed && [styles.compactPressablePressed, getMarkedPressStyle(true, { scale: 0.9, opacity: 0.84 })],
                            ]}
                            onPress={withHaptics(() => setActiveDrinkType(option.key))}
                          >
                            <ThemedText style={[styles.filterChipText, { color: selected ? colors.primaryText : colors.textMuted }]}> 
                              {option.label}
                            </ThemedText>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {activeDrinkType === 'cocktailAlcool' ? (
                    <View style={styles.filterGroup}>
                      <ThemedText style={[styles.filterLabel, { color: colors.textMuted }]}>{t('exploreAlcoholLabel')}</ThemedText>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterChipsRow}
                      >
                        <Pressable
                          android_ripple={{ color: activeAlcohol === 'all' ? 'rgba(255,255,255,0.24)' : colors.primary + '32' }}
                          style={({ pressed }) => [
                            styles.filterChip,
                            { backgroundColor: colors.surfaceSoft, borderColor: colors.border },
                            activeAlcohol === 'all' && { backgroundColor: colors.primary, borderColor: colors.primary },
                            pressed && [styles.compactPressablePressed, getMarkedPressStyle(true, { scale: 0.9, opacity: 0.84 })],
                          ]}
                          onPress={withHaptics(() => setActiveAlcohol('all'))}
                        >
                          <ThemedText style={[styles.filterChipText, { color: activeAlcohol === 'all' ? colors.primaryText : colors.textMuted }]}> 
                            {t('exploreAll')}
                          </ThemedText>
                        </Pressable>
                        {alcoholOptions.map((alcohol) => {
                          const selected = activeAlcohol === alcohol;
                          return (
                            <Pressable
                              key={alcohol}
                              android_ripple={{ color: selected ? 'rgba(255,255,255,0.24)' : colors.primary + '32' }}
                              style={({ pressed }) => [
                                styles.filterChip,
                                { backgroundColor: colors.surfaceSoft, borderColor: colors.border },
                                selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                                pressed && [styles.compactPressablePressed, getMarkedPressStyle(true, { scale: 0.9, opacity: 0.84 })],
                              ]}
                              onPress={withHaptics(() => setActiveAlcohol(alcohol))}
                            >
                              <ThemedText style={[styles.filterChipText, { color: selected ? colors.primaryText : colors.textMuted }]}> 
                                {alcoholLabels[alcohol]}
                              </ThemedText>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    </View>
                  ) : null}

                  <View style={styles.filterGroup}>
                    <ThemedText style={[styles.filterLabel, { color: colors.textMuted }]}>{t('exploreMoninLabel')}</ThemedText>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.filterChipsRow}
                    >
                      {moninOptions.map((option) => {
                        const selected = activeMonin === option.key;
                        return (
                          <Pressable
                            key={option.key}
                            android_ripple={{ color: selected ? 'rgba(255,255,255,0.24)' : colors.primary + '32' }}
                          style={({ pressed }) => [
                            styles.filterChip,
                            { backgroundColor: colors.surfaceSoft, borderColor: colors.border },
                            selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                            pressed && [styles.compactPressablePressed, getMarkedPressStyle(true, { scale: 0.9, opacity: 0.84 })],
                          ]}
                          onPress={withHaptics(() => setActiveMonin(option.key))}
                        >
                            <ThemedText style={[styles.filterChipText, { color: selected ? colors.primaryText : colors.textMuted }]}> 
                              {option.label}
                            </ThemedText>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              </ScrollView>

              <Pressable
                android_ripple={{ color: 'rgba(255,255,255,0.30)' }}
                style={({ pressed }) => [
                  styles.filterModalApply,
                  { backgroundColor: colors.primary },
                  pressed && [styles.compactPressablePressed, getMarkedPressStyle(true, { scale: 0.92, opacity: 0.84 })],
                ]}
                onPress={withHaptics(handleCloseFilters)}
              >
                <ThemedText style={[styles.filterModalApplyText, { color: colors.primaryText }]}>✓</ThemedText>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>

      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const stats = getRecipeStats(item.id);
          return (
            <RecipeCard
              recipe={item}
              machineId={selectedMachineId}
              language={language}
              colors={colors}
              resolvedTheme={resolvedTheme}
              isFavorite={favoriteRecipeIdSet.has(item.id)}
              onToggleFavorite={toggleFavorite}
              avgRating={stats.avgRating}
              votesCount={stats.votesCount}
            />
          );
        }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText type="subtitle">{t('exploreNoRecipesTitle')}</ThemedText>
            <ThemedText style={[styles.emptyStateText, { color: colors.textMuted }]}>{t('exploreNoRecipesDescription')}</ThemedText>
          </View>
        }
      />
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
    paddingBottom: 12,
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
    marginBottom: 10,
  },
  machineSwitcher: {
    flexDirection: 'row',
    gap: 8,
  },
  filtersSection: {
    marginTop: 10,
    gap: 8,
    backgroundColor: 'transparent',
  },
  filtersHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  filtersToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  openFiltersButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  openFiltersButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  openFiltersButtonIcon: {
    fontSize: 12,
    fontWeight: '700',
  },
  filtersToggleIcon: {
    fontSize: 14,
    fontWeight: '700',
  },
  filterModalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterModalBackdropPress: {
    ...StyleSheet.absoluteFillObject,
  },
  filterModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    maxHeight: '80%',
    paddingBottom: 16,
  },
  filterModalHeader: {
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  filterModalHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
  filterModalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterModalClose: {
    fontSize: 18,
    fontWeight: '700',
  },
  filterModalBody: {
    maxHeight: '78%',
  },
  filterModalBodyContent: {
    padding: 12,
    gap: 8,
    paddingBottom: 8,
  },
  filterModalApply: {
    marginHorizontal: 12,
    marginBottom: 6,
    marginTop: 4,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  filterModalApplyText: {
    fontSize: 20,
    fontWeight: '700',
  },
  resetButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filtersCollapsedSection: {
    gap: 6,
  },
  filtersCollapsedHint: {
    fontSize: 12,
    lineHeight: 16,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeFilterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 24,
    justifyContent: 'center',
  },
  activeFilterChipCompact: {
    paddingHorizontal: 6,
  },
  activeFilterChipText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  filterPanel: {
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 8,
  },
  filterGroup: {
    gap: 6,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 12,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 30,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  switcherButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  switcherButtonSelected: {
    borderWidth: 1,
  },
  switcherText: {
    fontSize: 13,
    fontWeight: '600',
  },
  switcherTextSelected: {
    fontWeight: '700',
  },
  compactPressablePressed: {
    transform: [{ scale: 0.92 }, { translateY: 1 }],
    opacity: 0.84,
    borderWidth: 1.2,
    shadowOpacity: 0.2,
  },
  inlinePressablePressed: {
    opacity: 0.84,
    transform: [{ scale: 0.92 }, { translateY: 1 }],
    borderWidth: 1.2,
    shadowOpacity: 0.2,
  },
  list: {
    padding: 16,
    paddingBottom: 24,
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
    shadowOpacity: 0.22,
    borderWidth: 1.2,
  },
  cardContent: {
    padding: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
    padding: 6,
  },
  cardLayout: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 14,
  },
  visualWrap: {
    width: 92,
    height: 92,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  visualFallback: {
    fontSize: 34,
  },
  cardThumbnail: {
    width: '100%',
    height: '100%',
  },
  cardMainContent: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 92,
  },
  recipeName: {
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  metaStack: {
    gap: 4,
  },
  metaRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaLine: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    flexShrink: 1,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});
