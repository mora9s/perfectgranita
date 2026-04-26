import type { CustomRecipe, Recipe } from '@/app/types/database';

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

export function mergeImportedAndCustomRecipes(importedRecipes: Recipe[], customRecipes: CustomRecipe[]): Recipe[] {
  const importedOnly = importedRecipes.filter((recipe) => recipe.isCustom !== true);
  const importedIds = new Set(importedOnly.map((recipe) => recipe.id));
  const sanitizedCustom = dedupeCustomRecipesById(customRecipes).filter((recipe) => !importedIds.has(recipe.id));

  return [...importedOnly, ...sanitizedCustom];
}
