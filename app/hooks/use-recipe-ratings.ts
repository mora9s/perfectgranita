import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchRatingsSnapshot,
  getOrCreateRaterKey,
  upsertRecipeRating,
  type RecipeRatingStats,
} from '@/app/services/recipe-ratings';

const EMPTY_STATS: RecipeRatingStats = {
  recipeId: '',
  avgRating: 0,
  votesCount: 0,
};

export function useRecipeRatings(recipeIds: string[]) {
  const [raterKey, setRaterKey] = useState<string | null>(null);
  const [statsByRecipeId, setStatsByRecipeId] = useState<Record<string, RecipeRatingStats>>({});
  const [userRatingsByRecipeId, setUserRatingsByRecipeId] = useState<Record<string, number>>({});

  const stableRecipeIds = useMemo(() => Array.from(new Set(recipeIds)).filter(Boolean).sort(), [recipeIds]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const key = await getOrCreateRaterKey();
      if (!cancelled) {
        setRaterKey(key);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!raterKey || stableRecipeIds.length === 0) {
      setStatsByRecipeId({});
      setUserRatingsByRecipeId({});
      return;
    }

    const snapshot = await fetchRatingsSnapshot(stableRecipeIds, raterKey);
    setStatsByRecipeId(snapshot.statsByRecipeId);
    setUserRatingsByRecipeId(snapshot.userRatingsByRecipeId);
  }, [raterKey, stableRecipeIds]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const rateRecipe = useCallback(
    async (recipeId: string, rating: number) => {
      if (!raterKey || !recipeId) {
        return;
      }

      const safeRating = Math.max(1, Math.min(5, Math.round(rating)));

      setUserRatingsByRecipeId((prev) => ({ ...prev, [recipeId]: safeRating }));

      await upsertRecipeRating(recipeId, safeRating, raterKey);
      await refresh();
    },
    [raterKey, refresh]
  );

  const getRecipeStats = useCallback(
    (recipeId: string): RecipeRatingStats => {
      return statsByRecipeId[recipeId] ?? EMPTY_STATS;
    },
    [statsByRecipeId]
  );

  const getUserRating = useCallback(
    (recipeId: string): number => {
      return userRatingsByRecipeId[recipeId] ?? 0;
    },
    [userRatingsByRecipeId]
  );

  return {
    getRecipeStats,
    getUserRating,
    rateRecipe,
    refreshRatings: refresh,
  };
}
