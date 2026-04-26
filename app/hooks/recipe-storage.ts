import * as FileSystem from 'expo-file-system/legacy';
import type { CustomRecipe } from '@/app/types/database';
import { parseCustomRecipes } from '@/app/hooks/recipe-persistence';

const STORAGE_FILE_NAME = 'custom-recipes-v1.json';
const storageDirectory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
const storagePath = storageDirectory ? `${storageDirectory}${STORAGE_FILE_NAME}` : null;

export async function loadPersistedCustomRecipes(): Promise<CustomRecipe[]> {
  if (!storagePath) {
    return [];
  }

  try {
    const raw = await FileSystem.readAsStringAsync(storagePath);
    return parseCustomRecipes(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('does not exist') || message.includes('No such file')) {
      return [];
    }

    throw error;
  }
}

export async function persistCustomRecipes(customRecipes: CustomRecipe[]): Promise<void> {
  if (!storagePath) {
    return;
  }

  await FileSystem.writeAsStringAsync(storagePath, JSON.stringify(customRecipes));
}
