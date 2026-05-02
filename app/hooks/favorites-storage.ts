import * as FileSystem from 'expo-file-system/legacy';
import { parseFavoriteRecipeIds, sanitizeFavoriteRecipeIds } from '@/app/hooks/favorites-persistence';

const STORAGE_FILE_NAME = 'favorite-recipe-ids-v1.json';
const storageDirectory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
const storagePath = storageDirectory ? `${storageDirectory}${STORAGE_FILE_NAME}` : null;

export async function loadPersistedFavoriteRecipeIds(): Promise<string[]> {
  if (!storagePath) {
    return [];
  }

  try {
    const raw = await FileSystem.readAsStringAsync(storagePath);
    return parseFavoriteRecipeIds(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('does not exist') || message.includes('No such file')) {
      return [];
    }

    throw error;
  }
}

export async function persistFavoriteRecipeIds(favoriteRecipeIds: string[]): Promise<void> {
  if (!storagePath) {
    return;
  }

  const safeIds = sanitizeFavoriteRecipeIds(favoriteRecipeIds);
  await FileSystem.writeAsStringAsync(storagePath, JSON.stringify(safeIds));
}
