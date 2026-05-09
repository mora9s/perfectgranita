import type { Recipe, RecipeLocalizedContent } from '@/app/types/database';

export interface RemoteRecipeRow {
  slug: string;
  sort_order: number;
  updated_at: string;
  name_fr: string;
  name_en: string | null;
  description_fr: string;
  description_en: string | null;
  drink_category: Recipe['drinkCategory'];
  alcohol_category: Recipe['alcoholCategory'] | null;
  uses_monin: boolean;
  recipe_payload: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

export function parseRemoteRecipeRow(row: RemoteRecipeRow): Recipe | null {
  if (!isString(row.slug) || !isRecord(row.recipe_payload)) {
    return null;
  }

  const payload = row.recipe_payload as Record<string, unknown>;

  const i18nRoot = isRecord(payload.i18n) ? (payload.i18n as Record<string, unknown>) : {};
  const i18nFr = isRecord(i18nRoot.fr) ? i18nRoot.fr : {};
  const i18nEn = isRecord(i18nRoot.en) ? i18nRoot.en : {};

  const recipe: Recipe = {
    ...(payload as unknown as Recipe),
    id: row.slug,
    name: row.name_fr,
    description: row.description_fr,
    drinkCategory: row.drink_category,
    alcoholCategory: row.alcohol_category ?? undefined,
    usesMonin: row.uses_monin,
    i18n: {
      ...(payload.i18n as Recipe['i18n'] | undefined),
      fr: {
        ...(i18nFr as RecipeLocalizedContent),
        name: row.name_fr,
        description: row.description_fr,
      },
      en: {
        ...(i18nEn as RecipeLocalizedContent),
        ...(row.name_en ? { name: row.name_en } : {}),
        ...(row.description_en ? { description: row.description_en } : {}),
      },
    },
    tips: asStringArray(payload.tips),
    notes: asStringArray(payload.notes),
    instructions: asStringArray(payload.instructions),
    ingredients: asStringArray(payload.ingredients),
    time: isRecord(payload.time)
      ? {
          prep: isString(payload.time.prep) ? payload.time.prep : '—',
          freezing: isString(payload.time.freezing) ? payload.time.freezing : '—',
          total: isString(payload.time.total) ? payload.time.total : '—',
        }
      : {
          prep: '—',
          freezing: '—',
          total: '—',
        },
  };

  if (!isString(recipe.name) || !isString(recipe.description) || !isString(recipe.emoji)) {
    return null;
  }

  return recipe;
}
