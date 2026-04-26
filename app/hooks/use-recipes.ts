import { useEffect, useMemo, useState } from 'react';
import type { Recipe, CustomRecipe } from '@/app/types/database';
import { importedCocktailRecipes } from '@/app/data/imported-cocktail-recipes';
import { mergeImportedAndCustomRecipes } from '@/app/hooks/recipe-persistence';
import { loadPersistedCustomRecipes, persistCustomRecipes } from '@/app/hooks/recipe-storage';

let sharedCustomRecipes: CustomRecipe[] = [];
let sharedError: string | null = null;
let sharedHasInitialized = false;
let sharedIsLoading = false;
let sharedChangedDuringLoad = false;
let persistQueue: Promise<void> = Promise.resolve();

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

async function initializeStore() {
  if (sharedHasInitialized || sharedIsLoading) {
    return;
  }

  sharedIsLoading = true;
  notifySubscribers();

  try {
    const loadedRecipes = await loadPersistedCustomRecipes();
    sharedCustomRecipes = mergeCustomRecipesById(loadedRecipes, sharedCustomRecipes);
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
  }
}

export function useRecipes() {
  const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>(sharedCustomRecipes);
  const [isLoading, setIsLoading] = useState<boolean>(!sharedHasInitialized || sharedIsLoading);
  const [error, setError] = useState<string | null>(sharedError);

  useEffect(() => {
    const listener = () => {
      setCustomRecipes(sharedCustomRecipes);
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
    return mergeImportedAndCustomRecipes(importedCocktailRecipes, customRecipes);
  }, [customRecipes]);

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

  return {
    recipes,
    customRecipes,
    addCustomRecipe,
    deleteCustomRecipe,
    isLoading,
    error,
  };
}
