import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/app/hooks/use-recipes';
import { MACHINE_OPTIONS } from '@/app/machine/config';
import { useMachine } from '@/app/machine/machine-context';
import { useTheme } from '@/app/theme/theme-context';
import { scaleRecipeProportions } from '@/app/machine/scale';
import type { Recipe } from '@/app/types/database';
import type { MachineId } from '@/app/types/machine';

interface RecipeCardProps {
  recipe: Recipe;
  machineId: MachineId;
  colors: ReturnType<typeof useTheme>['colors'];
  resolvedTheme: ReturnType<typeof useTheme>['resolvedTheme'];
}

function RecipeCard({ recipe, machineId, colors, resolvedTheme }: RecipeCardProps) {
  const scaledProportions = scaleRecipeProportions(recipe, machineId);
  const machineProfile = recipe.machineProfiles?.[machineId];

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <ThemedText style={styles.emoji}>{recipe.emoji}</ThemedText>
          {recipe.media?.image ? (
            <Image source={recipe.media.image} style={styles.cardThumbnail} resizeMode="cover" />
          ) : null}
        </View>
        <ThemedText type="subtitle" style={styles.recipeName}>
          {recipe.name}
        </ThemedText>
        <ThemedText style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
          {recipe.description}
        </ThemedText>

        {machineProfile ? (
          <View style={[styles.proportionPreview, { backgroundColor: colors.surfaceSoft }]}>
            <ThemedText style={[styles.proportionText, { color: colors.textMuted }]}>
              ⚙️ {machineProfile.machineProgram}
            </ThemedText>
            <ThemedText style={[styles.proportionText, { color: colors.textMuted }]}>
              🧪 ABV ~{machineProfile.estimatedAbvPercent ?? '?'}%
            </ThemedText>
            <ThemedText style={[styles.proportionText, { color: colors.textMuted }]}>
              📦 {machineProfile.fillVolumeMl} ml
            </ThemedText>
          </View>
        ) : (
          <View style={[styles.proportionPreview, { backgroundColor: colors.surfaceSoft }]}>
            <ThemedText style={[styles.proportionText, { color: colors.textMuted }]}>💧 {scaledProportions.water}</ThemedText>
            <ThemedText style={[styles.proportionText, { color: colors.textMuted }]}>🍬 {scaledProportions.sugar}</ThemedText>
            <ThemedText style={[styles.proportionText, { color: colors.textMuted }]}>🍓 {scaledProportions.flavor}</ThemedText>
          </View>
        )}

        <View style={styles.timeContainer}>
          <ThemedText style={[styles.timeText, { color: resolvedTheme === 'dark' ? '#C4B5FD' : colors.primary }]}>
            ⏱️ {recipe.time.total}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const { recipes } = useRecipes();
  const { selectedMachine, selectedMachineId, setSelectedMachineId } = useMachine();
  const { colors, resolvedTheme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <ThemedText type="title" style={[styles.headerTitle, { color: colors.primary }]}>
          🔍 Recettes
        </ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          Proportions adaptées à {selectedMachine.name}
        </ThemedText>

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
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} machineId={selectedMachineId} colors={colors} resolvedTheme={resolvedTheme} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
    marginBottom: 12,
  },
  machineSwitcher: {
    flexDirection: 'row',
    gap: 8,
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
    padding: 20,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 40,
  },
  cardThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  recipeName: {
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  proportionPreview: {
    borderRadius: 10,
    padding: 10,
    gap: 2,
    marginBottom: 12,
  },
  proportionText: {
    fontSize: 13,
    lineHeight: 18,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
