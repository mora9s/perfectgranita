import { useState, useEffect } from 'react';
import { Recipe, CustomRecipe } from '@/app/types/database';
import { importedCocktailRecipes } from '@/app/data/imported-cocktail-recipes';

const defaultRecipes: Recipe[] = importedCocktailRecipes;

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>(defaultRecipes);
  const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>([]);

  useEffect(() => {
    const custom = recipes.filter((r): r is CustomRecipe => r.isCustom === true);
    setCustomRecipes(custom);
  }, [recipes]);

  const addCustomRecipe = (recipe: Omit<CustomRecipe, 'id' | 'createdAt' | 'isCustom'>) => {
    const newRecipe: CustomRecipe = {
      ...recipe,
      id: `custom-${Date.now()}`,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    setRecipes((prev) => [...prev, newRecipe]);
    return newRecipe;
  };

  const deleteCustomRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  return {
    recipes,
    customRecipes,
    addCustomRecipe,
    deleteCustomRecipe,
  };
}
