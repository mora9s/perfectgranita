import { Image, Pressable, StyleSheet, ScrollView, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/app/hooks/use-recipes';
import { useFavorites } from '@/app/hooks/use-favorites';
import { MACHINE_OPTIONS } from '@/app/machine/config';
import { useLanguage } from '@/app/language/language-context';
import { useMachine } from '@/app/machine/machine-context';
import { getLocalizedRecipeDrinkVisual, getLocalizedRecipeText } from '@/app/recipes/localization';
import { useTheme } from '@/app/theme/theme-context';
import { scaleRecipeProportions } from '@/app/machine/scale';
import { withHaptics } from '@/app/utils/press-feedback';
import type { Recipe, RecipeIngredient } from '@/app/types/database';
import type { MachineId } from '@/app/types/machine';

interface RecipeDetailProps {
  recipe: Recipe;
  machineId: MachineId;
  selectedMachineName: string;
  selectedMachineCapacityLiters: number;
  showMachineSwitcher: boolean;
  onMachineSelect: (machineId: MachineId) => void;
  colors: ReturnType<typeof useTheme>['colors'];
  resolvedTheme: ReturnType<typeof useTheme>['resolvedTheme'];
  language: 'fr' | 'en';
}

function RecipeDetail({
  recipe,
  machineId,
  selectedMachineName,
  selectedMachineCapacityLiters,
  showMachineSwitcher,
  onMachineSelect,
  colors,
  resolvedTheme,
  language,
}: RecipeDetailProps) {
  const { t } = useLanguage();
  const machineProfile = recipe.machineProfiles?.[machineId];
  const scaledProportions = scaleRecipeProportions(recipe, machineId);
  const baseIngredientRows: RecipeIngredient[] =
    recipe.ingredientItems ?? recipe.ingredients.map((entry) => ({ quantity: '', item: entry }));

  const ingredientRows: Array<{ quantity: string; item: string; note?: string }> = baseIngredientRows.map((entry) => {
    const perMachineVolume = entry.volumesMl?.[machineId];
    if (typeof perMachineVolume === 'number') {
      return {
        ...entry,
        quantity: `${perMachineVolume} ml`,
      };
    }
    return entry;
  });

  const localizedName = getLocalizedRecipeText(recipe, language, 'name');
  const localizedDescription = getLocalizedRecipeText(recipe, language, 'description');
  const localizedDrinkVisual = getLocalizedRecipeDrinkVisual(recipe, language);

  const proportionLabels: Record<'water' | 'sugar' | 'flavor', string> = {
    water: t('proportionWater'),
    sugar: t('proportionSugar'),
    flavor: t('proportionFlavor'),
  };

  const beforeStartSteps =
    recipe.machineGuidance?.beforeStart ?? [
      t('recipeDefaultBeforeStart1'),
      t('recipeDefaultBeforeStart2'),
    ];

  const pourAndRunSteps =
    recipe.machineGuidance?.pourAndRun ?? [
      t('recipeDefaultPourRun1'),
      t('recipeDefaultPourRun2'),
    ];

  return (
    <ScrollView contentContainerStyle={styles.detailContainer}>
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: resolvedTheme === 'dark' ? '#1A2737' : '#EEF6FF',
            borderColor: resolvedTheme === 'dark' ? '#2A425A' : '#D6E7FF',
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.heroTopRow}>
          <View style={styles.heroTopCopy}>
            <ThemedText type="title" style={styles.detailTitle}>
              {localizedName}
            </ThemedText>
            <ThemedText style={[styles.detailDescription, { color: colors.textMuted }]}>{localizedDescription}</ThemedText>
          </View>

          {!recipe.media?.image ? <ThemedText style={styles.detailEmoji}>{recipe.emoji}</ThemedText> : null}
        </View>

        {showMachineSwitcher ? (
          <View style={styles.machineSwitcher}>
            {MACHINE_OPTIONS.map((machine) => {
              const isSelected = machine.id === machineId;

              return (
                <Pressable
                  key={machine.id}
                  android_ripple={{ color: resolvedTheme === 'dark' ? 'rgba(216,204,255,0.24)' : 'rgba(109,40,217,0.18)' }}
                  style={({ pressed }) => [
                    styles.switcherButton,
                    {
                      backgroundColor: resolvedTheme === 'dark' ? '#2E2446' : '#F5F3FF',
                      borderColor: resolvedTheme === 'dark' ? '#4A3E66' : '#DDD6FE',
                    },
                    isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                    pressed && styles.compactPressablePressed,
                  ]}
                  onPress={withHaptics(() => onMachineSelect(machine.id))}
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

        {recipe.media?.image ? (
          <View style={[styles.heroImageFrame, { backgroundColor: colors.surface }]}> 
            <Image source={recipe.media.image} style={styles.heroImage} resizeMode="contain" />
          </View>
        ) : null}

        <View style={styles.metaRow}>
          {recipe.serves ? (
            <View style={[styles.metaChip, { backgroundColor: colors.surface }]}> 
              <ThemedText style={[styles.metaChipText, { color: colors.textMuted }]}>👥 {recipe.serves}</ThemedText>
            </View>
          ) : null}
          <View style={[styles.metaChip, { backgroundColor: colors.surface }]}> 
            <ThemedText style={[styles.metaChipText, { color: colors.textMuted }]}>⏱ {recipe.time.total}</ThemedText>
          </View>
          {recipe.garnish ? (
            <View style={[styles.metaChip, { backgroundColor: colors.surface }]}> 
              <ThemedText style={[styles.metaChipText, { color: colors.textMuted }]}>✨ {recipe.garnish}</ThemedText>
            </View>
          ) : null}
        </View>
      </View>

      {localizedDrinkVisual ? (
        <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>{t('recipeVisualSectionTitle')}</ThemedText>
          <View style={[styles.drinkVisualCard, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
            <ThemedText style={styles.drinkVisualEmoji}>{localizedDrinkVisual.emoji}</ThemedText>
            <View style={styles.drinkVisualCopy}>
              <ThemedText style={styles.drinkVisualTitle}>{localizedDrinkVisual.title}</ThemedText>
              <ThemedText style={[styles.drinkVisualSubtitle, { color: colors.textMuted }]}>
                {localizedDrinkVisual.subtitle}
              </ThemedText>
            </View>
          </View>
        </View>
      ) : null}

      <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>{t('recipeIngredientsSectionTitle')}</ThemedText>
        {ingredientRows.map((item, index) => (
          <View key={`${item.item}-${index}`} style={[styles.ingredientRow, { borderBottomColor: colors.border }]}>
            <ThemedText style={[styles.ingredientQty, { color: colors.primary }]}>
              {item.quantity || '•'}
            </ThemedText>
            <View style={styles.ingredientTextWrap}>
              <ThemedText style={styles.ingredientItem}>{item.item}</ThemedText>
              {item.note ? (
                <ThemedText style={[styles.ingredientNote, { color: colors.textMuted }]}>{item.note}</ThemedText>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}> 
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>{t('recipeMachineSectionTitle')}</ThemedText>

        <View style={[styles.machineProfileSummary, { backgroundColor: colors.surfaceSoft }]}> 
          <ThemedText style={styles.stepLine}>{t('recipeActiveMachineLabel')}: {selectedMachineName} ({selectedMachineCapacityLiters}L)</ThemedText>
          <ThemedText style={styles.stepLine}>{t('recipeTargetVolumeLabel')}: {machineProfile ? `${machineProfile.fillVolumeMl} ml` : `${selectedMachineCapacityLiters}L`}</ThemedText>
          <ThemedText style={styles.stepLine}>{t('recipeProgramLabel')}: {machineProfile ? machineProfile.machineProgram : '—'}</ThemedText>
          {typeof machineProfile?.estimatedAbvPercent === 'number' ? (
            <ThemedText style={styles.stepLine}>{t('recipeEstimatedAbvLabel')}: ~{machineProfile.estimatedAbvPercent}%</ThemedText>
          ) : null}
          <ThemedText style={styles.stepLine}>{t('recipeMachineTimeLabel')}: {machineProfile ? machineProfile.estimatedRunTime : recipe.time.total}</ThemedText>
        </View>

        {machineProfile ? (
          <View style={[styles.machineBlock, { backgroundColor: colors.surfaceSoft }]}>
            <ThemedText style={styles.machineBlockTitle}>{t('recipeMachineStepsTitle')} ({selectedMachineName})</ThemedText>
            {machineProfile.steps.map((step, index) => (
              <ThemedText key={`machine-profile-step-${index}`} style={styles.stepLine}>
                {index + 1}. {step}
              </ThemedText>
            ))}
          </View>
        ) : (
          <>
            <View style={[styles.machineBlock, { backgroundColor: colors.surfaceSoft }]}>
              <ThemedText style={styles.machineBlockTitle}>{t('recipePrepareBeforeTitle')}</ThemedText>
              {beforeStartSteps.map((step, index) => (
                <ThemedText key={`before-${index}`} style={styles.stepLine}>
                  {index + 1}. {step}
                </ThemedText>
              ))}
            </View>

            <View style={[styles.machineBlock, { backgroundColor: colors.surfaceSoft }]}>
              <ThemedText style={styles.machineBlockTitle}>{t('recipePourRunTitle')}</ThemedText>
              {pourAndRunSteps.map((step, index) => (
                <ThemedText key={`pour-${index}`} style={styles.stepLine}>
                  {index + 1}. {step}
                </ThemedText>
              ))}
            </View>

            <View style={styles.proportionList}>
              {(Object.keys(scaledProportions) as Array<keyof typeof scaledProportions>).map((key) => (
                <View key={key} style={[styles.proportionRow, { borderBottomColor: colors.border }]}>
                  <ThemedText style={[styles.proportionLabel, { color: colors.textMuted }]}>{proportionLabels[key]}</ThemedText>
                  <ThemedText style={styles.proportionValue}>{scaledProportions[key]}</ThemedText>
                </View>
              ))}
            </View>
          </>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>{t('recipeBasePreparationTitle')}</ThemedText>
        {recipe.instructions.map((item, index) => (
          <ThemedText key={index} style={styles.stepLine}>
            {index + 1}. {item}
          </ThemedText>
        ))}
      </View>

      {(recipe.tips?.length || recipe.notes?.length) ? (
        <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>{t('recipeTipsTitle')}</ThemedText>
          {recipe.tips?.map((item, index) => (
            <ThemedText key={`tip-${index}`} style={styles.stepLine}>• {item}</ThemedText>
          ))}
          {recipe.notes?.map((item, index) => (
            <ThemedText key={`note-${index}`} style={[styles.stepLine, { color: colors.textMuted }]}>
              {t('recipeNoteLabel')}: {item}
            </ThemedText>
          ))}
        </View>
      ) : null}

      <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>{t('recipeTimeSectionTitle')}</ThemedText>
        {Object.entries(recipe.time).map(([key, value]) => {
          const labelByKey = {
            prep: t('recipeTimePrep'),
            freezing: t('recipeTimeFreezing'),
            total: t('recipeTimeTotal'),
          } as const;

          return (
            <ThemedText key={key} style={styles.stepLine}>
              {labelByKey[key as keyof typeof labelByKey]}: {value}
            </ThemedText>
          );
        })}
      </View>
    </ScrollView>
  );
}

export default function RecipeScreen() {
  const { recipes, isLoading } = useRecipes();
  const { favoriteRecipeIdSet, toggleFavorite } = useFavorites();
  const { machinePreferenceMode, selectedMachineId, selectedMachine, setSelectedMachineId } = useMachine();
  const { colors, resolvedTheme } = useTheme();
  const { t, language } = useLanguage();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const recipe = recipes.find((r) => r.id === id);
  const isFavorite = recipe ? favoriteRecipeIdSet.has(recipe.id) : false;

  if (!recipe && isLoading) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <ThemedText type="title" style={[styles.errorTitle, { color: colors.primary }]}> 
            {language === 'fr' ? 'Chargement…' : 'Loading…'}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!recipe) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <ThemedText type="title" style={[styles.errorTitle, { color: colors.danger }]}>{t('recipeMissingTitle')}</ThemedText>
          <ThemedText style={[styles.errorDescription, { color: colors.textMuted }]}>
            {t('recipeMissingDescription')}
          </ThemedText>
          <Pressable onPress={withHaptics(() => router.back())} style={[styles.backButton, { backgroundColor: colors.primary }]}>
            <ThemedText style={[styles.backButtonText, { color: colors.primaryText }]}>{t('recipeBackButton')}</ThemedText>
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
          title: getLocalizedRecipeText(recipe, language, 'name'),
        }}
      />
      <View style={styles.backHeader}>
        <View style={styles.backHeaderRow}>
          <Pressable
            onPress={withHaptics(() => router.back())}
            style={[
              styles.backButtonTop,
              {
                backgroundColor: resolvedTheme === 'dark' ? 'rgba(26,29,36,0.85)' : 'rgba(255,255,255,0.85)',
                shadowColor: colors.shadow,
              },
            ]}
          >
            <ThemedText style={[styles.backButtonTopText, { color: colors.primary }]}>←</ThemedText>
          </Pressable>
          <Pressable
            onPress={withHaptics(() => toggleFavorite(recipe.id))}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? t('favoritesRemove') : t('favoritesAdd')}
            style={[
              styles.favoriteButtonTop,
              {
                backgroundColor: resolvedTheme === 'dark' ? 'rgba(26,29,36,0.85)' : 'rgba(255,255,255,0.85)',
                shadowColor: colors.shadow,
              },
            ]}
          >
            <FontAwesome name={isFavorite ? 'star' : 'star-o'} size={19} color={isFavorite ? colors.primary : colors.textMuted} />
          </Pressable>
        </View>
      </View>
      <RecipeDetail
        recipe={recipe}
        machineId={selectedMachineId}
        selectedMachineName={selectedMachine.name}
        selectedMachineCapacityLiters={selectedMachine.capacityLiters}
        showMachineSwitcher={machinePreferenceMode === 'both'}
        onMachineSelect={setSelectedMachineId}
        colors={colors}
        resolvedTheme={resolvedTheme}
        language={language}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  backHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButtonTop: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteButtonTop: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  backButtonTopText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailContainer: {
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  heroTopCopy: {
    flex: 1,
  },
  detailEmoji: {
    fontSize: 48,
    lineHeight: 56,
  },
  heroImageFrame: {
    width: '100%',
    borderRadius: 16,
    padding: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  detailTitle: {
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  metaRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  metaChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  drinkVisualCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  drinkVisualEmoji: {
    fontSize: 32,
  },
  drinkVisualCopy: {
    flex: 1,
  },
  drinkVisualTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  drinkVisualSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  ingredientQty: {
    width: 72,
    fontSize: 14,
    fontWeight: '700',
  },
  ingredientTextWrap: {
    flex: 1,
  },
  ingredientItem: {
    fontSize: 15,
    lineHeight: 22,
  },
  ingredientNote: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  machineNote: {
    fontSize: 13,
    marginBottom: 10,
  },
  machineSwitcher: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  machineProfileSummary: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 4,
  },
  switcherButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  switcherText: {
    fontSize: 13,
    fontWeight: '700',
  },
  compactPressablePressed: {
    transform: [{ scale: 0.94 }, { translateY: 1 }],
    opacity: 0.84,
  },
  machineBlock: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  machineBlockTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  stepLine: {
    fontSize: 15,
    marginBottom: 7,
    lineHeight: 22,
  },
  proportionList: {
    marginTop: 4,
  },
  proportionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    borderBottomWidth: 1,
    paddingVertical: 9,
  },
  proportionLabel: {
    fontSize: 14,
  },
  proportionValue: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    flexShrink: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    marginBottom: 10,
  },
  errorDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
