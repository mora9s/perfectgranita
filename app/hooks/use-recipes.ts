import { useEffect, useMemo, useState } from 'react';
import type { Recipe, CustomRecipe } from '@/app/types/database';
import { importedCocktailRecipes } from '@/app/data/imported-cocktail-recipes';
import {
  buildRecipesCatalog,
  resolveRecipesSource,
  type RecipesSource,
} from '@/app/hooks/recipe-persistence';
import { loadPersistedCustomRecipes, persistCustomRecipes } from '@/app/hooks/recipe-storage';
import { fetchPublishedRemoteRecipes } from '@/app/services/remote-recipes';
import { loadRemoteRecipeCache, persistRemoteRecipeCache } from '@/app/hooks/remote-recipe-cache';

let sharedCustomRecipes: CustomRecipe[] = [];
let sharedRemoteRecipes: Recipe[] = [];
let sharedSource: RecipesSource = 'bundled';
let sharedLastRemoteSyncAt: string | null = null;
let sharedHasRemoteFetchSucceeded = false;

let sharedError: string | null = null;
let sharedHasInitialized = false;
let sharedIsLoading = false;
let sharedChangedDuringLoad = false;
let persistQueue: Promise<void> = Promise.resolve();
let remoteRefreshInFlight: Promise<void> | null = null;

const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach((listener) => listener());
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Unexpected recipes persistence error';
}

function mergeCustomRecipesById(primary: CustomRecipe[], secondary: CustomRecipe[]): CustomRecipe[] {
  const byId = new Map<string, CustomRecipe>();
  primary.forEach((recipe) => byId.set(recipe.id, recipe));
  secondary.forEach((recipe) => byId.set(recipe.id, recipe));
  return Array.from(byId.values());
}

function queuePersistCustomRecipes(customRecipes: CustomRecipe[]) {
  const snapshot = [...customRecipes];

  persistQueue = persistQueue
    .catch(() => undefined)
    .then(() => persistCustomRecipes(snapshot))
    .catch((persistError) => {
      sharedError = toErrorMessage(persistError);
      notifySubscribers();
    });
}

function createCustomRecipeId() {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function applyRemoteRecipes(remoteRecipes: Recipe[], options: { hasRemoteFetchSucceeded: boolean; lastRemoteSyncAt: string | null }) {
  sharedRemoteRecipes = remoteRecipes;
  sharedHasRemoteFetchSucceeded = options.hasRemoteFetchSucceeded;
  sharedLastRemoteSyncAt = options.lastRemoteSyncAt;
  sharedSource = resolveRecipesSource(sharedRemoteRecipes, sharedHasRemoteFetchSucceeded);
}

async function refreshRemoteRecipes() {
  if (remoteRefreshInFlight) {
    return remoteRefreshInFlight;
  }

  remoteRefreshInFlight = (async () => {
    try {
      const remoteRecipes = await fetchPublishedRemoteRecipes();
      const fetchedAt = new Date().toISOString();

      applyRemoteRecipes(remoteRecipes, {
        hasRemoteFetchSucceeded: true,
        lastRemoteSyncAt: fetchedAt,
      });

      await persistRemoteRecipeCache({
        fetchedAt,
        recipes: remoteRecipes,
      });

      sharedError = null;
      notifySubscribers();
    } catch {
      sharedSource = resolveRecipesSource(sharedRemoteRecipes, sharedHasRemoteFetchSucceeded);
      notifySubscribers();
    } finally {
      remoteRefreshInFlight = null;
    }
  })();

  return remoteRefreshInFlight;
}

async function initializeStore() {
  if (sharedHasInitialized || sharedIsLoading) {
    return;
  }

  sharedIsLoading = true;
  notifySubscribers();

  try {
    const [loadedRecipes, remoteCache] = await Promise.all([
      loadPersistedCustomRecipes(),
      loadRemoteRecipeCache(),
    ]);

    sharedCustomRecipes = mergeCustomRecipesById(loadedRecipes, sharedCustomRecipes);

    if (remoteCache) {
      applyRemoteRecipes(remoteCache.recipes, {
        hasRemoteFetchSucceeded: false,
        lastRemoteSyncAt: remoteCache.fetchedAt,
      });
    } else {
      applyRemoteRecipes([], {
        hasRemoteFetchSucceeded: false,
        lastRemoteSyncAt: null,
      });
    }

    sharedError = null;

    if (sharedChangedDuringLoad) {
      queuePersistCustomRecipes(sharedCustomRecipes);
    }
  } catch (error) {
    sharedError = toErrorMessage(error);
  } finally {
    sharedHasInitialized = true;
    sharedIsLoading = false;
    sharedChangedDuringLoad = false;
    notifySubscribers();
    void refreshRemoteRecipes();
  }
}

export function useRecipes() {
  const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>(sharedCustomRecipes);
  const [remoteRecipes, setRemoteRecipes] = useState<Recipe[]>(sharedRemoteRecipes);
  const [source, setSource] = useState<RecipesSource>(sharedSource);
  const [lastRemoteSyncAt, setLastRemoteSyncAt] = useState<string | null>(sharedLastRemoteSyncAt);
  const [isLoading, setIsLoading] = useState<boolean>(!sharedHasInitialized || sharedIsLoading);
  const [error, setError] = useState<string | null>(sharedError);

  useEffect(() => {
    const listener = () => {
      setCustomRecipes(sharedCustomRecipes);
      setRemoteRecipes(sharedRemoteRecipes);
      setSource(sharedSource);
      setLastRemoteSyncAt(sharedLastRemoteSyncAt);
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

  const recipes = useMemo<Recipe[]>(() => {
    return buildRecipesCatalog(importedCocktailRecipes, remoteRecipes, customRecipes);
  }, [customRecipes, remoteRecipes]);

  const remoteRecipeIdSet = useMemo(() => {
    return new Set(remoteRecipes.map((recipe) => recipe.id));
  }, [remoteRecipes]);

  const addCustomRecipe = (recipe: Omit<CustomRecipe, 'id' | 'createdAt' | 'isCustom'>) => {
    const newRecipe: CustomRecipe = {
      ...recipe,
      id: createCustomRecipeId(),
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    sharedCustomRecipes = [...sharedCustomRecipes, newRecipe];
    sharedChangedDuringLoad = sharedChangedDuringLoad || sharedIsLoading;
    sharedError = null;
    notifySubscribers();

    if (sharedIsLoading && !sharedHasInitialized) {
      sharedChangedDuringLoad = true;
    } else {
      queuePersistCustomRecipes(sharedCustomRecipes);
    }

    return newRecipe;
  };

  const deleteCustomRecipe = (id: string) => {
    sharedCustomRecipes = sharedCustomRecipes.filter((recipe) => recipe.id !== id);
    sharedChangedDuringLoad = sharedChangedDuringLoad || sharedIsLoading;
    sharedError = null;
    notifySubscribers();

    if (sharedIsLoading && !sharedHasInitialized) {
      sharedChangedDuringLoad = true;
    } else {
      queuePersistCustomRecipes(sharedCustomRecipes);
    }
  };

  const refreshRecipes = async () => {
    await refreshRemoteRecipes();
  };

  return {
    recipes,
    customRecipes,
    remoteRecipeIdSet,
    addCustomRecipe,
    deleteCustomRecipe,
    isLoading,
    error,
    source,
    refreshRecipes,
    lastRemoteSyncAt,
  };
}
