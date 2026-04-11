export interface RecipeIngredient {
  quantity: string;
  item: string;
  note?: string;
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
  tips?: string[];
  notes?: string[];
  machineGuidance?: RecipeMachineGuidance;
  drinkVisual?: RecipeDrinkVisual;
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
