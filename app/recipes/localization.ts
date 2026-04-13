import type { AppLanguage } from '@/app/language/language-context';
import type { Recipe, RecipeDrinkVisual } from '@/app/types/database';

export type RecipeContentLocale = 'fr' | 'en';

export function getLocalizedRecipeText(
  recipe: Recipe,
  language: AppLanguage,
  field: 'name' | 'description'
): string;
export function getLocalizedRecipeText(
  recipe: Recipe,
  language: AppLanguage,
  field: 'tips' | 'notes'
): string[] | undefined;
export function getLocalizedRecipeText(
  recipe: Recipe,
  language: AppLanguage,
  field: 'name' | 'description' | 'tips' | 'notes'
) {
  const localizedValue = recipe.i18n?.[language]?.[field];

  if (localizedValue !== undefined) {
    return localizedValue;
  }

  const fallbackValue = recipe.i18n?.fr?.[field];

  if (fallbackValue !== undefined) {
    return fallbackValue;
  }

  return recipe[field];
}

export function getLocalizedRecipeDrinkVisual(recipe: Recipe, language: AppLanguage): RecipeDrinkVisual | undefined {
  if (!recipe.drinkVisual) {
    return undefined;
  }

  const localized = recipe.i18n?.[language]?.drinkVisual;
  const fallback = recipe.i18n?.fr?.drinkVisual;

  return {
    ...recipe.drinkVisual,
    title: localized?.title ?? fallback?.title ?? recipe.drinkVisual.title,
    subtitle: localized?.subtitle ?? fallback?.subtitle ?? recipe.drinkVisual.subtitle,
  };
}
