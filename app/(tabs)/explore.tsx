import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecipes } from '@/app/hooks/use-recipes';
import { MACHINE_OPTIONS } from '@/app/machine/config';
import { useMachine } from '@/app/machine/machine-context';
import { scaleRecipeProportions } from '@/app/machine/scale';
import type { Recipe } from '@/app/types/database';
import type { MachineId } from '@/app/types/machine';

interface RecipeCardProps {
  recipe: Recipe;
  machineId: MachineId;
}

function RecipeCard({ recipe, machineId }: RecipeCardProps) {
  const scaledProportions = scaleRecipeProportions(recipe, machineId);

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
    >
      <View style={styles.cardContent}>
        <ThemedText style={styles.emoji}>{recipe.emoji}</ThemedText>
        <ThemedText type="subtitle" style={styles.recipeName}>
          {recipe.name}
        </ThemedText>
        <ThemedText style={styles.description} numberOfLines={2}>
          {recipe.description}
        </ThemedText>

        <View style={styles.proportionPreview}>
          <ThemedText style={styles.proportionText}>💧 {scaledProportions.water}</ThemedText>
          <ThemedText style={styles.proportionText}>🍬 {scaledProportions.sugar}</ThemedText>
          <ThemedText style={styles.proportionText}>🍓 {scaledProportions.flavor}</ThemedText>
        </View>

        <View style={styles.timeContainer}>
          <ThemedText style={styles.timeText}>⏱️ {recipe.time.total}</ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const { recipes } = useRecipes();
  const { selectedMachine, selectedMachineId, setSelectedMachineId } = useMachine();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          🔍 Recettes
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Proportions adaptées à {selectedMachine.name}
        </ThemedText>

        <View style={styles.machineSwitcher}>
          {MACHINE_OPTIONS.map((machine) => {
            const isSelected = machine.id === selectedMachineId;

            return (
              <Pressable
                key={machine.id}
                style={[styles.switcherButton, isSelected && styles.switcherButtonSelected]}
                onPress={() => setSelectedMachineId(machine.id)}
              >
                <ThemedText style={[styles.switcherText, isSelected && styles.switcherTextSelected]}>
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
        renderItem={({ item }) => <RecipeCard recipe={item} machineId={selectedMachineId} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    color: '#8B5CF6',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  machineSwitcher: {
    flexDirection: 'row',
    gap: 8,
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
  list: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 20,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  recipeName: {
    color: '#1C1C1E',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 20,
  },
  proportionPreview: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    gap: 2,
    marginBottom: 12,
  },
  proportionText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
});
