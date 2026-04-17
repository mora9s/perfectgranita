import { FlatList, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/app/hooks/use-recipes';
import { MACHINE_OPTIONS } from '@/app/machine/config';
import { useLanguage } from '@/app/language/language-context';
import { getLocalizedRecipeText } from '@/app/recipes/localization';
import { useMachine } from '@/app/machine/machine-context';
import { useTheme } from '@/app/theme/theme-context';
import { scaleRecipeProportions } from '@/app/machine/scale';
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
}

function RecipeCard({ recipe, machineId, language, colors, resolvedTheme }: RecipeCardProps) {
  const scaledProportions = scaleRecipeProportions(recipe, machineId);
  const machineProfile = recipe.machineProfiles?.[machineId];
  const recipeImage = recipe.media?.image;
  const hasImage = Boolean(recipeImage);
  const localizedName = getLocalizedRecipeText(recipe, language, 'name');
  const localizedDescription = getLocalizedRecipeText(recipe, language, 'description');

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
    >
      <View style={styles.cardContent}>
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
            {recipeImage ? (
              <Image source={recipeImage} style={styles.cardThumbnail} resizeMode="cover" />
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

            <View style={styles.metaStack}>
              <ThemedText style={[styles.metaLine, { color: colors.textMuted }]} numberOfLines={1}>
                ⚙️ {machineProfile ? machineProfile.machineProgram : scaledProportions.flavor}
              </ThemedText>
              <View style={styles.metaRowCompact}>
                <ThemedText style={[styles.metaLine, { color: colors.textMuted }]} numberOfLines={1}>
                  {machineProfile ? `📦 ${machineProfile.fillVolumeMl} ml` : `💧 ${scaledProportions.water}`}
                </ThemedText>
                <ThemedText style={[styles.metaLine, { color: resolvedTheme === 'dark' ? '#C4B5FD' : colors.primary }]} numberOfLines={1}>
                  ⏱️ {recipe.time.total}
                </ThemedText>
              </View>
            </View>
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
  const { recipes } = useRecipes();
  const { machinePreferenceMode, selectedMachine, selectedMachineId, setSelectedMachineId } = useMachine();
  const { colors, resolvedTheme } = useTheme();
  const { t, language } = useLanguage();
  const [activeDrinkType, setActiveDrinkType] = useState<DrinkTypeFilter>('all');
  const [activeAlcohol, setActiveAlcohol] = useState<RecipeAlcoholCategory | 'all'>('all');
  const [activeMonin, setActiveMonin] = useState<MoninFilter>('all');
  const [filtersExpanded, setFiltersExpanded] = useState(false);

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

  const handleResetFilters = () => {
    setActiveDrinkType('all');
    setActiveAlcohol('all');
    setActiveMonin('all');
  };

  const handleDrinkTypeSelect = (drinkType: DrinkTypeFilter) => {
    setActiveDrinkType(drinkType);
    setFiltersExpanded(false);
  };

  const handleAlcoholSelect = (alcohol: RecipeAlcoholCategory | 'all') => {
    setActiveAlcohol(alcohol);
    setFiltersExpanded(false);
  };

  const handleMoninSelect = (monin: MoninFilter) => {
    setActiveMonin(monin);
    setFiltersExpanded(false);
  };

  const showMachineSwitcher = machinePreferenceMode === 'both';

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
                  style={[
                    styles.switcherButton,
                    {
                      backgroundColor: resolvedTheme === 'dark' ? '#2E2446' : '#F5F3FF',
                      borderColor: resolvedTheme === 'dark' ? '#4A3E66' : '#DDD6FE',
                    },
                    isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setSelectedMachineId(machine.id)}
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
            <Pressable style={styles.filtersToggle} onPress={() => setFiltersExpanded((value) => !value)}>
              <ThemedText type="defaultSemiBold">{t('exploreFiltersTitle')}</ThemedText>
              <ThemedText style={[styles.filtersToggleIcon, { color: colors.textMuted }]}> 
                {filtersExpanded ? '▴' : '▾'}
              </ThemedText>
            </Pressable>
            {filtersActive ? (
              <Pressable
                style={[styles.resetButton, { borderColor: colors.primary, backgroundColor: colors.primary + '12' }]}
                onPress={handleResetFilters}
              >
                <ThemedText style={[styles.resetButtonText, { color: colors.primary }]}>{t('exploreReset')}</ThemedText>
              </Pressable>
            ) : null}
          </View>

          {!filtersExpanded ? (
            <View style={styles.filtersCollapsedSection}>
              <ThemedText style={[styles.filtersCollapsedHint, { color: colors.textMuted }]}> 
                {filtersActive ? t('exploreFiltersActiveHint') : t('exploreFiltersCollapsedHint')}
              </ThemedText>
              {filtersActive ? (
                <View style={styles.activeFiltersRow}>
                  {activeFilterLabels.map((label) => (
                    <View
                      key={label}
                      style={[styles.activeFilterChip, { borderColor: colors.primary, backgroundColor: colors.primary + '1E' }]}
                    >
                      <ThemedText style={[styles.activeFilterChipText, { color: colors.primary }]}>{label}</ThemedText>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {filtersExpanded ? (
            <View
              style={[
                styles.filterPanel,
                { borderColor: colors.border, backgroundColor: colors.surfaceSoft },
              ]}
            >
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
                        style={[
                          styles.filterChip,
                          { backgroundColor: colors.surfaceSoft, borderColor: colors.border },
                          selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                        ]}
                        onPress={() => handleDrinkTypeSelect(option.key)}
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
                      style={[
                        styles.filterChip,
                        { backgroundColor: colors.surfaceSoft, borderColor: colors.border },
                        activeAlcohol === 'all' && { backgroundColor: colors.primary, borderColor: colors.primary },
                          ]}
                      onPress={() => handleAlcoholSelect('all')}
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
                          style={[
                            styles.filterChip,
                            { backgroundColor: colors.surfaceSoft, borderColor: colors.border },
                            selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                          ]}
                          onPress={() => handleAlcoholSelect(alcohol)}
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
                        style={[
                        styles.filterChip,
                          { backgroundColor: colors.surfaceSoft, borderColor: colors.border },
                          selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                        ]}
                        onPress={() => handleMoninSelect(option.key)}
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
          ) : null}
        </View>
      </View>

      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} machineId={selectedMachineId} language={language} colors={colors} resolvedTheme={resolvedTheme} />
        )}
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
  filtersToggleIcon: {
    fontSize: 14,
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
    gap: 8,
  },
  filtersCollapsedHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFilterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  activeFilterChipText: {
    fontSize: 12,
    fontWeight: '700',
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
  cardContent: {
    padding: 16,
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
