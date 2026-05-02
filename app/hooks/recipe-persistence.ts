import type { CustomRecipe, Recipe } from '@/app/types/database';

export type RecipesSource = 'remote' | 'cache' | 'bundled';

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isValidCustomRecipe(value: unknown): value is CustomRecipe {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<CustomRecipe> & {
    proportions?: Record<string, unknown>;
    time?: Record<string, unknown>;
  };

  return (
    candidate.isCustom === true
    && isString(candidate.id)
    && isString(candidate.createdAt)
    && isString(candidate.name)
    && isString(candidate.emoji)
    && isString(candidate.description)
    && isStringArray(candidate.ingredients)
    && isStringArray(candidate.instructions)
    && !!candidate.proportions
    && isString(candidate.proportions.water)
    && isString(candidate.proportions.sugar)
    && isString(candidate.proportions.flavor)
    && !!candidate.time
    && isString(candidate.time.prep)
    && isString(candidate.time.freezing)
    && isString(candidate.time.total)
  );
}

function dedupeCustomRecipesById(recipes: CustomRecipe[]): CustomRecipe[] {
  const byId = new Map<string, CustomRecipe>();
  recipes.forEach((recipe) => {
    byId.set(recipe.id, recipe);
  });

  return Array.from(byId.values());
}

export function parseCustomRecipes(rawPayload: string | null): CustomRecipe[] {
  if (!rawPayload) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawPayload);
  } catch {
    throw new Error('Could not parse persisted custom recipes');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Persisted custom recipes payload must be an array');
  }

  return parsed.filter(isValidCustomRecipe);
}

export function mergeCoreAndRemoteRecipes(coreRecipes: Recipe[], remoteRecipes: Recipe[]): Recipe[] {
  const coreOnly = coreRecipes.filter((recipe) => recipe.isCustom !== true);
  const coreIds = new Set(coreOnly.map((recipe) => recipe.id));

  const dedupedRemote: Recipe[] = [];
  const remoteIds = new Set<string>();

  remoteRecipes.forEach((recipe) => {
    if (recipe.isCustom === true) {
      return;
    }

    if (coreIds.has(recipe.id) || remoteIds.has(recipe.id)) {
      return;
    }

    remoteIds.add(recipe.id);
    dedupedRemote.push(recipe);
  });

  return [...coreOnly, ...dedupedRemote];
}

export function mergeImportedAndCustomRecipes(importedRecipes: Recipe[], customRecipes: CustomRecipe[]): Recipe[] {
  const importedOnly = importedRecipes.filter((recipe) => recipe.isCustom !== true);
  const importedIds = new Set(importedOnly.map((recipe) => recipe.id));
  const sanitizedCustom = dedupeCustomRecipesById(customRecipes).filter((recipe) => !importedIds.has(recipe.id));

  return [...importedOnly, ...sanitizedCustom];
}

export function buildRecipesCatalog(
  coreRecipes: Recipe[],
  remoteRecipes: Recipe[],
  customRecipes: CustomRecipe[],
): Recipe[] {
  const mergedCoreAndRemote = mergeCoreAndRemoteRecipes(coreRecipes, remoteRecipes);
  return mergeImportedAndCustomRecipes(mergedCoreAndRemote, customRecipes);
}

export function resolveRecipesSource(remoteRecipes: Recipe[], hasRemoteFetchSucceeded: boolean): RecipesSource {
  if (hasRemoteFetchSucceeded && remoteRecipes.length > 0) {
    return 'remote';
  }

  if (remoteRecipes.length > 0) {
    return 'cache';
  }

  return 'bundled';
}
