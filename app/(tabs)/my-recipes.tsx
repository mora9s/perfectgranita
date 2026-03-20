import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { RecipeProvider, useRecipes, type QuantityLevel } from '../../contexts/RecipeContext';

const LEVEL_ACCENT: Record<QuantityLevel, string> = {
  min: '#22C55E',
  inter: '#8B5CF6',
  max: '#F97316',
};

function MyRecipesScreenContent() {
  const params = useLocalSearchParams();
  const {
    recipes,
    addRecipe,
    quantityTargets,
    selectedQuantityLevel,
    setSelectedQuantityLevel,
    selectedQuantityTarget,
  } = useRecipes();
  const [newRecipeName, setNewRecipeName] = useState('');

  const handleAddRecipe = () => {
    if (newRecipeName.trim()) {
      addRecipe(newRecipeName.trim());
      setNewRecipeName('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Objectif · seuils Ninja Slushi</Text>
      <Text style={styles.subtitle}>
        Sélection du volume cible à préparer selon les seuils officiels Ninja Slushi : 475 ml minimum, 1890 ml maximum, avec un intermédiaire recalé à 1183 ml.
      </Text>

      <View style={styles.objectiveCard}>
        <Text style={styles.sectionTitle}>Niveaux Min / Inter / Max</Text>
        <View style={styles.levelRow}>
          {quantityTargets.map((target) => {
            const selected = target.level === selectedQuantityLevel;
            return (
              <Pressable
                key={target.level}
                style={[
                  styles.levelButton,
                  {
                    borderColor: LEVEL_ACCENT[target.level],
                    backgroundColor: selected ? LEVEL_ACCENT[target.level] : '#FFFFFF',
                  },
                ]}
                onPress={() => setSelectedQuantityLevel(target.level)}>
                <Text
                  style={[
                    styles.levelLabel,
                    { color: selected ? '#FFFFFF' : LEVEL_ACCENT[target.level] },
                  ]}>
                  {target.label}
                </Text>
                <Text
                  style={[
                    styles.levelVolume,
                    { color: selected ? '#FFFFFF' : '#111827' },
                  ]}>
                  {target.milliliters} ml
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.selectedCard}>
          <Text style={styles.selectedEyebrow}>Seuil actif Ninja Slushi</Text>
          <Text style={styles.selectedTitle}>
            {selectedQuantityTarget.label} · {selectedQuantityTarget.milliliters} ml
          </Text>
          <Text style={styles.selectedDescription}>
            {selectedQuantityTarget.description}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recettes de test</Text>
      {recipes.length === 0 ? (
        <Text style={styles.emptyState}>Aucune recette pour le moment. Ajoutez-en une.</Text>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.recipeCard}>
              <Text style={styles.recipeName}>{item.name}</Text>
              <Text style={styles.recipeMeta}>
                Seuil actuel : {selectedQuantityTarget.label} ({selectedQuantityTarget.milliliters} ml)
              </Text>
            </View>
          )}
          style={styles.recipeList}
        />
      )}

      <View style={styles.addRecipeContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nom de la nouvelle recette"
          value={newRecipeName}
          onChangeText={setNewRecipeName}
        />
        <Pressable style={styles.addButton} onPress={handleAddRecipe}>
          <Text style={styles.addButtonText}>Ajouter</Text>
        </Pressable>
      </View>

      {Object.keys(params).length > 0 && (
        <View style={styles.paramsContainer}>
          <Text style={styles.paramsTitle}>Paramètres de navigation</Text>
          {Object.entries(params).map(([key, value]) => (
            <Text key={key} style={styles.paramText}>{`${key}: ${value}`}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

export default function MyRecipesScreen() {
  return (
    <RecipeProvider>
      <MyRecipesScreenContent />
    </RecipeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 56,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
  },
  objectiveCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 10,
  },
  levelButton: {
    flex: 1,
    minHeight: 84,
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  levelVolume: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedCard: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    padding: 14,
  },
  selectedEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#6B7280',
    marginBottom: 6,
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  selectedDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },
  recipeList: {
    marginBottom: 16,
  },
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  recipeMeta: {
    marginTop: 6,
    fontSize: 13,
    color: '#6B7280',
  },
  emptyState: {
    marginBottom: 16,
    color: '#6B7280',
  },
  addRecipeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 'auto',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  paramsContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
  },
  paramsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#3730A3',
  },
  paramText: {
    fontSize: 14,
    color: '#4338CA',
  },
});
