import * as FileSystem from 'expo-file-system/legacy';
import type { Recipe } from '@/app/types/database';

export interface RemoteRecipeCache {
  fetchedAt: string;
  recipes: Recipe[];
}

const STORAGE_FILE_NAME = 'remote-recipes-cache-v1.json';
const storageDirectory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
const storagePath = storageDirectory ? `${storageDirectory}${STORAGE_FILE_NAME}` : null;

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isRecipeArray(value: unknown): value is Recipe[] {
  return Array.isArray(value);
}

function parseRemoteRecipeCache(rawPayload: string | null): RemoteRecipeCache | null {
  if (!rawPayload) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawPayload);
  } catch {
    throw new Error('Could not parse remote recipes cache');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Remote recipes cache payload must be an object');
  }

  const candidate = parsed as Partial<RemoteRecipeCache>;
  if (!isString(candidate.fetchedAt) || !isRecipeArray(candidate.recipes)) {
    return null;
  }

  return {
    fetchedAt: candidate.fetchedAt,
    recipes: candidate.recipes,
  };
}

export async function loadRemoteRecipeCache(): Promise<RemoteRecipeCache | null> {
  if (!storagePath) {
    return null;
  }

  try {
    const raw = await FileSystem.readAsStringAsync(storagePath);
    return parseRemoteRecipeCache(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('does not exist') || message.includes('No such file')) {
      return null;
    }

    throw error;
  }
}

export async function persistRemoteRecipeCache(cache: RemoteRecipeCache): Promise<void> {
  if (!storagePath) {
    return;
  }

  await FileSystem.writeAsStringAsync(storagePath, JSON.stringify(cache));
}
