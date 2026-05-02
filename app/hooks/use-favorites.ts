import { useEffect, useMemo, useState } from 'react';
import { loadPersistedFavoriteRecipeIds, persistFavoriteRecipeIds } from '@/app/hooks/favorites-storage';
import { sanitizeFavoriteRecipeIds } from '@/app/hooks/favorites-persistence';

let sharedFavoriteRecipeIds: string[] = [];
let sharedHasInitialized = false;
let sharedIsLoading = false;
let sharedChangedDuringLoad = false;
let sharedError: string | null = null;
let persistQueue: Promise<void> = Promise.resolve();

const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach((listener) => listener());
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unexpected favorites persistence error';
}

function queuePersistFavoriteRecipeIds(ids: string[]) {
  const snapshot = sanitizeFavoriteRecipeIds(ids);

  persistQueue = persistQueue
    .catch(() => undefined)
    .then(() => persistFavoriteRecipeIds(snapshot))
    .catch((persistError) => {
      sharedError = toErrorMessage(persistError);
      notifySubscribers();
    });
}

async function initializeStore() {
  if (sharedHasInitialized || sharedIsLoading) {
    return;
  }

  sharedIsLoading = true;
  notifySubscribers();

  try {
    const loadedIds = await loadPersistedFavoriteRecipeIds();
    sharedFavoriteRecipeIds = sanitizeFavoriteRecipeIds([...loadedIds, ...sharedFavoriteRecipeIds]);
    sharedError = null;

    if (sharedChangedDuringLoad) {
      queuePersistFavoriteRecipeIds(sharedFavoriteRecipeIds);
    }
  } catch (error) {
    sharedError = toErrorMessage(error);
  } finally {
    sharedHasInitialized = true;
    sharedIsLoading = false;
    sharedChangedDuringLoad = false;
    notifySubscribers();
  }
}

export function useFavorites() {
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<string[]>(sharedFavoriteRecipeIds);
  const [isLoading, setIsLoading] = useState<boolean>(!sharedHasInitialized || sharedIsLoading);
  const [error, setError] = useState<string | null>(sharedError);

  useEffect(() => {
    const listener = () => {
      setFavoriteRecipeIds(sharedFavoriteRecipeIds);
      setIsLoading(!sharedHasInitialized || sharedIsLoading);
      setError(sharedError);
    };

    subscribers.add(listener);
    listener();
    void initializeStore();

    return () => {
      subscribers.delete(listener);
    };
  }, []);

  const favoriteRecipeIdSet = useMemo(() => new Set(favoriteRecipeIds), [favoriteRecipeIds]);

  const isFavorite = (recipeId: string) => favoriteRecipeIdSet.has(recipeId);

  const toggleFavorite = (recipeId: string) => {
    const nextIds = isFavorite(recipeId)
      ? sharedFavoriteRecipeIds.filter((id) => id !== recipeId)
      : [...sharedFavoriteRecipeIds, recipeId];

    sharedFavoriteRecipeIds = sanitizeFavoriteRecipeIds(nextIds);
    sharedChangedDuringLoad = sharedChangedDuringLoad || sharedIsLoading;
    sharedError = null;
    notifySubscribers();

    if (sharedIsLoading && !sharedHasInitialized) {
      sharedChangedDuringLoad = true;
    } else {
      queuePersistFavoriteRecipeIds(sharedFavoriteRecipeIds);
    }
  };

  return {
    favoriteRecipeIds,
    favoriteRecipeIdSet,
    isFavorite,
    toggleFavorite,
    isLoading,
    error,
  };
}
