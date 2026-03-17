export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  description: string;
  ingredients: string[];
  proportions: {
    water: string;
    sugar: string;
    flavor: string;
  };
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
