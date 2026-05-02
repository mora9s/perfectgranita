import type { MachineId } from '@/app/types/machine';

export interface RecipeIngredient {
  quantity: string;
  item: string;
  note?: string;
  volumesMl?: Partial<Record<MachineId, number>>;
  abvPercent?: number;
}

export interface RecipeMachineGuidance {
  beforeStart: string[];
  pourAndRun: string[];
}

export interface RecipeDrinkVisual {
  emoji: string;
  title: string;
  subtitle: string;
}

export interface RecipeLocalizedDrinkVisual {
  title?: string;
  subtitle?: string;
}

export interface RecipeLocalizedContent {
  name?: string;
  description?: string;
  tips?: string[];
  notes?: string[];
  drinkVisual?: RecipeLocalizedDrinkVisual;
}

export interface RecipeI18n {
  fr?: RecipeLocalizedContent;
  en?: RecipeLocalizedContent;
}

export interface RecipeMedia {
  image?: any;
  imageUrl?: string;
  imageAlt?: string;
}

export interface RecipeMachineProfile {
  machineProgram: string;
  fillVolumeMl: number;
  estimatedRunTime: string;
  estimatedAbvPercent?: number;
  steps: string[];
}

export type RecipeAlcoholCategory =
  | 'tequila'
  | 'rhum'
  | 'vodka'
  | 'gin'
  | 'aperol-prosecco'
  | 'vin'
  | 'mixte'
  | 'autre';

export type RecipeDrinkCategory = 'cocktailAlcool' | 'cocktailSans' | 'autre';

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  description: string;
  ingredients: string[];
  ingredientItems?: RecipeIngredient[];
  proportions: {
    water: string;
    sugar: string;
    flavor: string;
  };
  serves?: string;
  garnish?: string;
  alcoholCategory?: RecipeAlcoholCategory;
  drinkCategory?: RecipeDrinkCategory;
  usesMonin?: boolean;
  tips?: string[];
  notes?: string[];
  machineGuidance?: RecipeMachineGuidance;
  machineProfiles?: Partial<Record<MachineId, RecipeMachineProfile>>;
  media?: RecipeMedia;
  drinkVisual?: RecipeDrinkVisual;
  i18n?: RecipeI18n;
  instructions: string[];
  time: {
    prep: string;
    freezing: string;
    total: string;
  };
  isCustom?: boolean;
}

export interface CustomRecipe extends Recipe {
  isCustom: true;
  createdAt: string;
}
