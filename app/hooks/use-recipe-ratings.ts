import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchRatingsSnapshot,
  getOrCreateRaterKey,
  upsertRecipeRating,
  type RecipeRatingScope,
  type RecipeRatingStats,
  type RecipeRatingTarget,
} from '@/app/services/recipe-ratings';

const EMPTY_STATS: RecipeRatingStats = {
  recipeId: '',
  scope: 'local',
  avgRating: 0,
  votesCount: 0,
};

function toScopedKey(scope: RecipeRatingScope, recipeId: string): string {
  return `${scope}:${recipeId}`;
}

export function useRecipeRatings(targets: RecipeRatingTarget[]) {
  const [raterKey, setRaterKey] = useState<string | null>(null);
  const [statsByScopedRecipeKey, setStatsByScopedRecipeKey] = useState<Record<string, RecipeRatingStats>>({});
  const [userRatingsByScopedRecipeKey, setUserRatingsByScopedRecipeKey] = useState<Record<string, number>>({});

  const stableTargets = useMemo(() => {
    return Array.from(new Set(targets.map((target) => toScopedKey(target.scope, target.recipeId))))
      .map((key) => {
        const [scope, ...parts] = key.split(':');
        const recipeId = parts.join(':');
        if ((scope !== 'local' && scope !== 'remote') || !recipeId) {
          return null;
        }
        return { scope, recipeId } as RecipeRatingTarget;
      })
      .filter((target): target is RecipeRatingTarget => Boolean(target));
  }, [targets.map((target) => toScopedKey(target.scope, target.recipeId)).join('|')]);

  const scopeByRecipeId = useMemo(() => {
    const map: Record<string, RecipeRatingScope> = {};
    stableTargets.forEach((target) => {
      map[target.recipeId] = target.scope;
    });
    return map;
  }, [stableTargets]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const key = await getOrCreateRaterKey();
        if (!cancelled) {
          setRaterKey(key);
        }
      } catch {
        if (!cancelled) {
          setRaterKey(null);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!raterKey || stableTargets.length === 0) {
      setStatsByScopedRecipeKey({});
      setUserRatingsByScopedRecipeKey({});
      return;
    }

    try {
      const snapshot = await fetchRatingsSnapshot(stableTargets, raterKey);
      setStatsByScopedRecipeKey(snapshot.statsByScopedRecipeKey);
      setUserRatingsByScopedRecipeKey(snapshot.userRatingsByScopedRecipeKey);
    } catch {
      setStatsByScopedRecipeKey({});
      setUserRatingsByScopedRecipeKey({});
    }
  }, [raterKey, stableTargets]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const rateRecipe = useCallback(
    async (recipeId: string, rating: number) => {
      if (!raterKey || !recipeId) {
        return;
      }

      const scope = scopeByRecipeId[recipeId] ?? 'local';
      const scopedKey = toScopedKey(scope, recipeId);
      const safeRating = Math.max(1, Math.min(5, Math.round(rating)));

      setUserRatingsByScopedRecipeKey((prev) => ({ ...prev, [scopedKey]: safeRating }));

      try {
        await upsertRecipeRating({ scope, recipeId }, safeRating, raterKey);
        await refresh();
      } catch {
        await refresh();
      }
    },
    [raterKey, refresh, scopeByRecipeId]
  );

  const getRecipeStats = useCallback(
    (recipeId: string): RecipeRatingStats => {
      const scope = scopeByRecipeId[recipeId] ?? 'local';
      return statsByScopedRecipeKey[toScopedKey(scope, recipeId)] ?? { ...EMPTY_STATS, recipeId, scope };
    },
    [scopeByRecipeId, statsByScopedRecipeKey]
  );

  const getUserRating = useCallback(
    (recipeId: string): number => {
      const scope = scopeByRecipeId[recipeId] ?? 'local';
      return userRatingsByScopedRecipeKey[toScopedKey(scope, recipeId)] ?? 0;
    },
    [scopeByRecipeId, userRatingsByScopedRecipeKey]
  );

  return {
    getRecipeStats,
    getUserRating,
    rateRecipe,
    refreshRatings: refresh,
  };
}
