import { Image, Pressable, StyleSheet, ScrollView, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/app/hooks/use-recipes';
import { MACHINE_OPTIONS } from '@/app/machine/config';
import { useLanguage } from '@/app/language/language-context';
import { useMachine } from '@/app/machine/machine-context';
import { useTheme } from '@/app/theme/theme-context';
import { scaleRecipeProportions } from '@/app/machine/scale';
import type { Recipe, RecipeIngredient } from '@/app/types/database';
import type { MachineId } from '@/app/types/machine';

interface RecipeDetailProps {
  recipe: Recipe;
  machineId: MachineId;
  selectedMachineName: string;
  selectedMachineCapacityLiters: number;
  onMachineSelect: (machineId: MachineId) => void;
  colors: ReturnType<typeof useTheme>['colors'];
  resolvedTheme: ReturnType<typeof useTheme>['resolvedTheme'];
}

function RecipeDetail({
  recipe,
  machineId,
  selectedMachineName,
  selectedMachineCapacityLiters,
  onMachineSelect,
  colors,
  resolvedTheme,
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
        {recipe.media?.image ? (
          <View style={[styles.heroImageFrame, { backgroundColor: colors.surface }]}>
            <Image source={recipe.media.image} style={styles.heroImage} resizeMode="contain" />
          </View>
        ) : null}
        <ThemedText style={styles.detailEmoji}>{recipe.emoji}</ThemedText>
        <ThemedText type="title" style={styles.detailTitle}>
          {recipe.name}
        </ThemedText>
        <ThemedText style={[styles.detailDescription, { color: colors.textMuted }]}>{recipe.description}</ThemedText>

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

      {recipe.drinkVisual ? (
        <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>{t('recipeVisualSectionTitle')}</ThemedText>
          <View style={[styles.drinkVisualCard, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
            <ThemedText style={styles.drinkVisualEmoji}>{recipe.drinkVisual.emoji}</ThemedText>
            <View style={styles.drinkVisualCopy}>
              <ThemedText style={styles.drinkVisualTitle}>{recipe.drinkVisual.title}</ThemedText>
              <ThemedText style={[styles.drinkVisualSubtitle, { color: colors.textMuted }]}>
                {recipe.drinkVisual.subtitle}
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
        <ThemedText style={[styles.machineNote, { color: colors.textMuted }]}>
          {t('recipeActiveMachineLabel')}: {selectedMachineName} ({selectedMachineCapacityLiters}L)
        </ThemedText>

        {machineProfile ? (
          <View style={[styles.machineProfileSummary, { backgroundColor: colors.surfaceSoft }]}>
            <ThemedText style={styles.machineBlockTitle}>{t('recipeProgramLabel')}: {machineProfile.machineProgram}</ThemedText>
            <ThemedText style={styles.stepLine}>{t('recipeTargetVolumeLabel')}: {machineProfile.fillVolumeMl} ml</ThemedText>
            {typeof machineProfile.estimatedAbvPercent === 'number' ? (
              <ThemedText style={styles.stepLine}>{t('recipeEstimatedAbvLabel')}: ~{machineProfile.estimatedAbvPercent}%</ThemedText>
            ) : null}
            <ThemedText style={styles.stepLine}>{t('recipeMachineTimeLabel')}: {machineProfile.estimatedRunTime}</ThemedText>
          </View>
        ) : null}

        <View style={styles.machineSwitcher}>
          {MACHINE_OPTIONS.map((machine) => {
            const isSelected = machine.id === machineId;

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
                onPress={() => onMachineSelect(machine.id)}
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
  const { recipes } = useRecipes();
  const { selectedMachineId, selectedMachine, setSelectedMachineId } = useMachine();
  const { colors, resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <ThemedText type="title" style={[styles.errorTitle, { color: colors.danger }]}>{t('recipeMissingTitle')}</ThemedText>
          <ThemedText style={[styles.errorDescription, { color: colors.textMuted }]}> 
            {t('recipeMissingDescription')}
          </ThemedText>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.primary }]}> 
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
          title: recipe.name,
        }}
      />
      <View style={styles.backHeader}>
        <Pressable
          onPress={() => router.back()}
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
      </View>
      <RecipeDetail
        recipe={recipe}
        machineId={selectedMachineId}
        selectedMachineName={selectedMachine.name}
        selectedMachineCapacityLiters={selectedMachine.capacityLiters}
        onMachineSelect={setSelectedMachineId}
        colors={colors}
        resolvedTheme={resolvedTheme}
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
    alignItems: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  detailEmoji: {
    fontSize: 64,
    marginBottom: 8,
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
    height: 220,
    borderRadius: 12,
  },
  detailTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  detailDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
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
    marginBottom: 14,
  },
  machineProfileSummary: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 2,
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
    fontWeight: '600',
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
