import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type QuantityLevel = 'min' | 'inter' | 'max';

export interface QuantityTarget {
  level: QuantityLevel;
  label: string;
  milliliters: number;
  description: string;
}

interface Recipe {
  id: string;
  name: string;
}

interface RecipeContextType {
  recipes: Recipe[];
  addRecipe: (name: string) => void;
  quantityTargets: QuantityTarget[];
  selectedQuantityLevel: QuantityLevel;
  setSelectedQuantityLevel: (level: QuantityLevel) => void;
  selectedQuantityTarget: QuantityTarget;
}

const quantityTargetsSeed: QuantityTarget[] = [
  {
    level: 'min',
    label: 'Min',
    milliliters: 475,
    description: 'Minimum Ninja Slushi : volume plancher recommandé pour lancer une préparation.',
  },
  {
    level: 'inter',
    label: 'Inter',
    milliliters: 1183,
    description: 'Niveau intermédiaire recalé à partir de la moyenne entre 475 ml et 1890 ml.',
  },
  {
    level: 'max',
    label: 'Max',
    milliliters: 1890,
    description: 'Maximum Ninja Slushi : volume haut à ne pas dépasser pour une préparation complète.',
  },
];

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedQuantityLevel, setSelectedQuantityLevel] =
    useState<QuantityLevel>('inter');

  const addRecipe = (name: string) => {
    setRecipes((prevRecipes) => [
      ...prevRecipes,
      { id: Date.now().toString(), name },
    ]);
  };

  const selectedQuantityTarget = useMemo(
    () =>
      quantityTargetsSeed.find((target) => target.level === selectedQuantityLevel) ??
      quantityTargetsSeed[1],
    [selectedQuantityLevel]
  );

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        addRecipe,
        quantityTargets: quantityTargetsSeed,
        selectedQuantityLevel,
        setSelectedQuantityLevel,
        selectedQuantityTarget,
      }}>
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
}
