import { StatusBar } from 'expo-status-bar';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState } from 'react';
import { useRecipes } from '@/app/hooks/use-recipes';
import { useTheme } from '@/app/theme/theme-context';

export default function ModalScreen() {
  const { addCustomRecipe } = useRecipes();
  const { colors, resolvedTheme } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      addCustomRecipe({
        name: name.trim(),
        emoji: '🍧',
        description: description.trim() || 'Ma recette personnalisée',
        ingredients: [],
        proportions: {
          water: '',
          sugar: '',
          flavor: ''
        },
        instructions: [],
        time: {
          prep: '',
          freezing: '',
          total: ''
        }
      });
      router.back();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <ThemedText type="title" style={[styles.title, { color: colors.primary }]}>
          ✨ Nouvelle Recette
        </ThemedText>
        <Pressable onPress={() => router.back()} style={[styles.closeButton, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.closeButtonText, { color: colors.textMuted }]}>✕</ThemedText>
        </Pressable>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Nom de la recette</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Mojito Frozen"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Description</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez votre recette..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
          />
        </View>

        <Pressable
          style={[
            styles.createButton,
            { backgroundColor: colors.primary },
            !name.trim() && { backgroundColor: resolvedTheme === 'dark' ? '#4A3E66' : '#C4B5FD' },
          ]}
          onPress={handleCreate}
          disabled={!name.trim()}
        >
          <ThemedText style={[styles.createButtonText, { color: colors.primaryText }]}>
            Créer la recette
          </ThemedText>
        </Pressable>
      </View>

      <StatusBar style={resolvedTheme === 'dark' ? 'light' : Platform.OS === 'ios' ? 'dark' : 'auto'} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    lineHeight: 38,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
