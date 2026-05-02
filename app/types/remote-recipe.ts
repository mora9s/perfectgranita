import type { Recipe } from '@/app/types/database';

export interface RemoteRecipeRow {
  id: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  sort_order: number;
  recipe: unknown;
  created_at: string;
  updated_at: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function parseRemoteRecipeRow(row: RemoteRecipeRow): Recipe | null {
  if (!isRecord(row.recipe)) {
    return null;
  }

  const payload = row.recipe;
  const proportions = isRecord(payload.proportions) ? payload.proportions : null;
  const time = isRecord(payload.time) ? payload.time : null;

  if (
    !isString(payload.name)
    || !isString(payload.emoji)
    || !isString(payload.description)
    || !isStringArray(payload.ingredients)
    || !isStringArray(payload.instructions)
    || !proportions
    || !isString(proportions.water)
    || !isString(proportions.sugar)
    || !isString(proportions.flavor)
    || !time
    || !isString(time.prep)
    || !isString(time.freezing)
    || !isString(time.total)
  ) {
    return null;
  }

  const recipePayload = payload as unknown as Recipe;

  return {
    ...recipePayload,
    id: row.slug || row.id,
  };
}
