import * as FileSystem from 'expo-file-system/legacy';
import { isSupabaseConfigured, supabase } from '@/app/services/supabase';

const RATER_KEY_FILE = 'rating-rater-key-v1.txt';
const storageDirectory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
const storagePath = storageDirectory ? `${storageDirectory}${RATER_KEY_FILE}` : null;

export type RecipeRatingScope = 'local' | 'remote';

export type RecipeRatingTarget = {
  scope: RecipeRatingScope;
  recipeId: string;
};

export type RecipeRatingStats = {
  recipeId: string;
  scope: RecipeRatingScope;
  avgRating: number;
  votesCount: number;
};

export type RatingsSnapshot = {
  statsByScopedRecipeKey: Record<string, RecipeRatingStats>;
  userRatingsByScopedRecipeKey: Record<string, number>;
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

function toScopedKey(scope: RecipeRatingScope, recipeId: string): string {
  return `${scope}:${recipeId}`;
}

export async function fetchRatingsSnapshot(targets: RecipeRatingTarget[], raterKey: string): Promise<RatingsSnapshot> {
  if (!isSupabaseConfigured || !supabase || targets.length === 0) {
    return { statsByScopedRecipeKey: {}, userRatingsByScopedRecipeKey: {} };
  }

  const uniqueTargets = Array.from(new Set(targets.map((target) => toScopedKey(target.scope, target.recipeId))))
    .map((key) => {
      const [scope, ...parts] = key.split(':');
      const recipeId = parts.join(':');
      if ((scope !== 'local' && scope !== 'remote') || !recipeId) {
        return null;
      }
      return { scope, recipeId } as RecipeRatingTarget;
    })
    .filter((target): target is RecipeRatingTarget => Boolean(target));

  const remoteRecipeIds = uniqueTargets.filter((target) => target.scope === 'remote').map((target) => target.recipeId);
  const localRecipeIds = uniqueTargets.filter((target) => target.scope === 'local').map((target) => target.recipeId);

  const baseStatsQuery = supabase.from('recipe_rating_stats').select('scope, recipe_key, avg_rating, votes_count');
  const statsQuery = remoteRecipeIds.length > 0 && localRecipeIds.length > 0
    ? baseStatsQuery.or(`and(scope.eq.remote,recipe_key.in.(${remoteRecipeIds.join(',')})),and(scope.eq.local,recipe_key.in.(${localRecipeIds.join(',')}))`)
    : remoteRecipeIds.length > 0
      ? baseStatsQuery.eq('scope', 'remote').in('recipe_key', remoteRecipeIds)
      : baseStatsQuery.eq('scope', 'local').in('recipe_key', localRecipeIds);

  const baseUserQuery = supabase
    .from('recipe_ratings')
    .select('scope, recipe_key, rating')
    .eq('rater_key', raterKey);
  const userQuery = remoteRecipeIds.length > 0 && localRecipeIds.length > 0
    ? baseUserQuery.or(`and(scope.eq.remote,recipe_key.in.(${remoteRecipeIds.join(',')})),and(scope.eq.local,recipe_key.in.(${localRecipeIds.join(',')}))`)
    : remoteRecipeIds.length > 0
      ? baseUserQuery.eq('scope', 'remote').in('recipe_key', remoteRecipeIds)
      : baseUserQuery.eq('scope', 'local').in('recipe_key', localRecipeIds);

  const [{ data: statsRows, error: statsError }, { data: userRows, error: userError }] = await Promise.all([
    statsQuery,
    userQuery,
  ]);

  if (statsError) {
    throw statsError;
  }
  if (userError) {
    throw userError;
  }

  const statsByScopedRecipeKey: Record<string, RecipeRatingStats> = {};
  for (const row of statsRows ?? []) {
    const scope = row.scope === 'local' || row.scope === 'remote' ? row.scope : null;
    const recipeId = typeof row.recipe_key === 'string' ? row.recipe_key : '';
    const avgRating = normalizeRating(row.avg_rating);
    const votesCount = typeof row.votes_count === 'number' ? row.votes_count : 0;

    if (!scope || !recipeId || avgRating === null) {
      continue;
    }

    statsByScopedRecipeKey[toScopedKey(scope, recipeId)] = {
      recipeId,
      scope,
      avgRating,
      votesCount,
    };
  }

  const userRatingsByScopedRecipeKey: Record<string, number> = {};
  for (const row of userRows ?? []) {
    const scope = row.scope === 'local' || row.scope === 'remote' ? row.scope : null;
    const recipeId = typeof row.recipe_key === 'string' ? row.recipe_key : '';
    const rating = normalizeRating(row.rating);
    if (!scope || !recipeId || rating === null) {
      continue;
    }
    userRatingsByScopedRecipeKey[toScopedKey(scope, recipeId)] = Math.round(rating);
  }

  return { statsByScopedRecipeKey, userRatingsByScopedRecipeKey };
}

export async function upsertRecipeRating(target: RecipeRatingTarget, rating: number, raterKey: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  const safeRating = Math.max(1, Math.min(5, Math.round(rating)));

  const { error } = await supabase.from('recipe_ratings').upsert(
    {
      // Legacy compatibility: 0002 had recipe_id NOT NULL.
      // Keep writing it until all environments applied the nullable migration.
      recipe_id: target.recipeId,
      scope: target.scope,
      recipe_key: target.recipeId,
      rater_key: raterKey,
      rating: safeRating,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'scope,recipe_key,rater_key' }
  );

  if (error) {
    throw error;
  }
}
