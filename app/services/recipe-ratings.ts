import * as FileSystem from 'expo-file-system/legacy';
import { isSupabaseConfigured, supabase } from '@/app/services/supabase';

const RATER_KEY_FILE = 'rating-rater-key-v1.txt';
const storageDirectory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
const storagePath = storageDirectory ? `${storageDirectory}${RATER_KEY_FILE}` : null;

export type RecipeRatingStats = {
  recipeId: string;
  avgRating: number;
  votesCount: number;
};

export type RatingsSnapshot = {
  statsByRecipeId: Record<string, RecipeRatingStats>;
  userRatingsByRecipeId: Record<string, number>;
};

function normalizeRating(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  const rounded = Math.round(value * 10) / 10;
  if (rounded < 1 || rounded > 5) {
    return null;
  }
  return rounded;
}

async function readPersistedRaterKey(): Promise<string | null> {
  if (!storagePath) {
    return null;
  }

  try {
    const value = (await FileSystem.readAsStringAsync(storagePath)).trim();
    if (value.length >= 12) {
      return value;
    }
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('does not exist') || message.includes('No such file')) {
      return null;
    }
    throw error;
  }
}

function createRaterKey(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `device-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export async function getOrCreateRaterKey(): Promise<string> {
  const existing = await readPersistedRaterKey();
  if (existing) {
    return existing;
  }

  const created = createRaterKey();
  if (storagePath) {
    await FileSystem.writeAsStringAsync(storagePath, created);
  }
  return created;
}

export async function fetchRatingsSnapshot(recipeIds: string[], raterKey: string): Promise<RatingsSnapshot> {
  if (!isSupabaseConfigured || !supabase || recipeIds.length === 0) {
    return { statsByRecipeId: {}, userRatingsByRecipeId: {} };
  }

  const uniqueIds = Array.from(new Set(recipeIds));

  const [{ data: statsRows, error: statsError }, { data: userRows, error: userError }] = await Promise.all([
    supabase
      .from('recipe_rating_stats')
      .select('recipe_id, avg_rating, votes_count')
      .in('recipe_id', uniqueIds),
    supabase
      .from('recipe_ratings')
      .select('recipe_id, rating')
      .eq('rater_key', raterKey)
      .in('recipe_id', uniqueIds),
  ]);

  if (statsError) {
    throw statsError;
  }
  if (userError) {
    throw userError;
  }

  const statsByRecipeId: Record<string, RecipeRatingStats> = {};
  for (const row of statsRows ?? []) {
    const recipeId = typeof row.recipe_id === 'string' ? row.recipe_id : '';
    const avgRating = normalizeRating(row.avg_rating);
    const votesCount = typeof row.votes_count === 'number' ? row.votes_count : 0;

    if (!recipeId || avgRating === null) {
      continue;
    }

    statsByRecipeId[recipeId] = {
      recipeId,
      avgRating,
      votesCount,
    };
  }

  const userRatingsByRecipeId: Record<string, number> = {};
  for (const row of userRows ?? []) {
    const recipeId = typeof row.recipe_id === 'string' ? row.recipe_id : '';
    const rating = normalizeRating(row.rating);
    if (!recipeId || rating === null) {
      continue;
    }
    userRatingsByRecipeId[recipeId] = Math.round(rating);
  }

  return { statsByRecipeId, userRatingsByRecipeId };
}

export async function upsertRecipeRating(recipeId: string, rating: number, raterKey: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  const safeRating = Math.max(1, Math.min(5, Math.round(rating)));

  const { error } = await supabase.from('recipe_ratings').upsert(
    {
      recipe_id: recipeId,
      rater_key: raterKey,
      rating: safeRating,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'recipe_id,rater_key' }
  );

  if (error) {
    throw error;
  }
}
