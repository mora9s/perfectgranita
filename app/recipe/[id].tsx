import { Pressable, StyleSheet, ScrollView, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/app/hooks/use-recipes';
import { MACHINE_OPTIONS } from '@/app/machine/config';
import { useMachine } from '@/app/machine/machine-context';
import { useTheme } from '@/app/theme/theme-context';
import { scaleRecipeProportions } from '@/app/machine/scale';
import type { Recipe } from '@/app/types/database';
import type { MachineId } from '@/app/types/machine';

interface RecipeDetailProps {
  recipe: Recipe;
  machineId: MachineId;
  selectedMachineName: string;
  onMachineSelect: (machineId: MachineId) => void;
  colors: ReturnType<typeof useTheme>['colors'];
  resolvedTheme: ReturnType<typeof useTheme>['resolvedTheme'];
}

function RecipeDetail({
  recipe,
  machineId,
  selectedMachineName,
  onMachineSelect,
  colors,
  resolvedTheme,
}: RecipeDetailProps) {
  const scaledProportions = scaleRecipeProportions(recipe, machineId);

  return (
    <ScrollView contentContainerStyle={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <ThemedText style={styles.detailEmoji}>{recipe.emoji}</ThemedText>
        <ThemedText type="title" style={styles.detailTitle}>
          {recipe.name}
        </ThemedText>
        <ThemedText style={[styles.detailDescription, { color: colors.textMuted }]}>
          {recipe.description}
        </ThemedText>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
          📋 INGRÉDIENTS
        </ThemedText>
        {recipe.ingredients.map((item, index) => (
          <ThemedText key={index} style={styles.listItem}>
            • {item}
          </ThemedText>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
          ⚖️ PROPORTIONS
        </ThemedText>
        <ThemedText style={[styles.machineNote, { color: colors.textMuted }]}>
          Machine active: {selectedMachineName}
        </ThemedText>
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
        {Object.entries(scaledProportions).map(([key, value]) => (
          <ThemedText key={key} style={styles.listItem}>
            {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
          </ThemedText>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
          📝 INSTRUCTIONS
        </ThemedText>
        {recipe.instructions.map((item, index) => (
          <ThemedText key={index} style={styles.listItem}>
            {index + 1}. {item}
          </ThemedText>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
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
  const { selectedMachineId, selectedMachine, setSelectedMachineId } = useMachine();
  const { colors, resolvedTheme } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <ThemedText type="title" style={[styles.errorTitle, { color: colors.danger }]}>Recette introuvable</ThemedText>
          <ThemedText style={[styles.errorDescription, { color: colors.textMuted }]}>
            La recette que vous recherchez n'existe pas.
          </ThemedText>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.primary }]}>
            <ThemedText style={[styles.backButtonText, { color: colors.primaryText }]}>Retour</ThemedText>
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
  detailHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  detailEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  detailTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  detailDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 15,
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
  listItem: {
    fontSize: 16,
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
