import { Pressable, StyleSheet, ScrollView, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/app/hooks/use-recipes';
import { MACHINE_OPTIONS } from '@/app/machine/config';
import { useMachine } from '@/app/machine/machine-context';
import { scaleRecipeProportions } from '@/app/machine/scale';
import type { Recipe } from '@/app/types/database';
import type { MachineId } from '@/app/types/machine';

interface RecipeDetailProps {
  recipe: Recipe;
  machineId: MachineId;
  selectedMachineName: string;
  onMachineSelect: (machineId: MachineId) => void;
}

function RecipeDetail({ recipe, machineId, selectedMachineName, onMachineSelect }: RecipeDetailProps) {
  const scaledProportions = scaleRecipeProportions(recipe, machineId);

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
        <ThemedText style={styles.machineNote}>
          Machine active: {selectedMachineName}
        </ThemedText>
        <View style={styles.machineSwitcher}>
          {MACHINE_OPTIONS.map((machine) => {
            const isSelected = machine.id === machineId;

            return (
              <Pressable
                key={machine.id}
                style={[styles.switcherButton, isSelected && styles.switcherButtonSelected]}
                onPress={() => onMachineSelect(machine.id)}
              >
                <ThemedText style={[styles.switcherText, isSelected && styles.switcherTextSelected]}>
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
  const { selectedMachineId, selectedMachine, setSelectedMachineId } = useMachine();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const recipe = recipes.find((r) => r.id === id);

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
        </Pressable>
      </View>
      <RecipeDetail
        recipe={recipe}
        machineId={selectedMachineId}
        selectedMachineName={selectedMachine.name}
        onMachineSelect={setSelectedMachineId}
      />
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
  machineNote: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 10,
  },
  machineSwitcher: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  switcherButton: {
    flex: 1,
    backgroundColor: '#F5F3FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingVertical: 8,
    alignItems: 'center',
  },
  switcherButtonSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  switcherText: {
    fontSize: 13,
    color: '#6D28D9',
    fontWeight: '600',
  },
  switcherTextSelected: {
    color: '#FFFFFF',
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
