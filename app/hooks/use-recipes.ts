import { useState, useEffect } from 'react';
import { Recipe, CustomRecipe } from '@/app/types/database';

const defaultRecipes: Recipe[] = [
  {
    id: 'lemon',
    name: 'Granita au Citron',
    emoji: '🍋',
    description: 'Le classique sicilien par excellence, rafraichissant et acidule',
    ingredients: [
      "500ml d'eau",
      '150g de sucre',
      '200ml de jus de citron frais',
      "Zeste d'un citron bio"
    ],
    ingredientItems: [
      { quantity: '500ml', item: 'Eau froide' },
      { quantity: '150g', item: 'Sucre blanc fin' },
      { quantity: '200ml', item: 'Jus de citron frais', note: 'filtre si pulpe epaisse' },
      { quantity: '1', item: 'Zeste de citron bio', note: 'facultatif, pour le parfum' }
    ],
    proportions: {
      water: '500ml',
      sugar: '150g',
      flavor: '200ml + zeste'
    },
    serves: '4-5 verres',
    garnish: 'Zeste fin de citron',
    tips: [
      'Refroidis completement la base avant de la verser dans la machine.',
      'Si le citron est tres acide, ajoute 10 a 20 g de sucre.'
    ],
    machineGuidance: {
      beforeStart: [
        'Melange jusqua dissolution complete du sucre.',
        'Passe au tamis fin pour retirer zestes epais et fibres.'
      ],
      pourAndRun: [
        'Verse la preparation dans la cuve sans depasser la ligne max.',
        'Selectionne le mode granita et lance un premier cycle.',
        'Si la texture est trop liquide, prolonge de 5 minutes.'
      ]
    },
    instructions: [
      "Porter l'eau et le sucre a ebullition dans une casserole",
      'Laisser refroidir completement le sirop',
      'Ajouter le jus de citron frais et le zeste rape',
      'Melanger puis filtrer si necessaire',
      'La preparation est prete pour la machine'
    ],
    time: {
      prep: '15 minutes',
      freezing: '20-30 minutes machine',
      total: '~40 minutes'
    },
    isCustom: false
  },
  {
    id: 'coffee',
    name: 'Granita au Cafe',
    emoji: '☕',
    description: 'Version sicilienne du cafe frappe, intense et revigorante',
    ingredients: [
      "500ml d'eau",
      '150g de sucre',
      '200ml de cafe expresso fort',
      '1 cuillere a cafe de cacao en poudre (optionnel)'
    ],
    ingredientItems: [
      { quantity: '500ml', item: 'Eau froide' },
      { quantity: '150g', item: 'Sucre blanc' },
      { quantity: '200ml', item: 'Expresso refroidi', note: 'double extraction recommandee' },
      { quantity: '1 c. a cafe', item: 'Cacao non sucre', note: 'optionnel' }
    ],
    proportions: {
      water: '500ml',
      sugar: '150g',
      flavor: '200ml de cafe'
    },
    serves: '4 verres',
    garnish: 'Creme fouetee ou cacao',
    tips: [
      'Un cafe chaud dans la cuve degrade la texture: toujours refroidir.',
      'Utilise un sucre fin pour un melange plus rapide.'
    ],
    machineGuidance: {
      beforeStart: [
        'Prepare le cafe et laisse-le retomber a temperature froide.',
        'Melange eau + sucre + cafe jusqua obtention dune base uniforme.'
      ],
      pourAndRun: [
        'Verse lentement dans la cuve pour limiter la mousse.',
        'Lance le mode granita puis controle la texture apres 15 minutes.',
        'Ajoute 2-3 glacons seulement si tu veux accelerer legerement la prise.'
      ]
    },
    instructions: [
      'Preparer le cafe expresso et le laisser refroidir',
      "Porter l'eau et le sucre a ebullition",
      'Melanger le sirop refroidi avec le cafe',
      'Ajouter le cacao si desire',
      'Filtrer puis verser dans la machine'
    ],
    time: {
      prep: '20 minutes',
      freezing: '20-25 minutes machine',
      total: '~45 minutes'
    },
    isCustom: false
  },
  {
    id: 'strawberry',
    name: 'Granita a la Fraise',
    emoji: '🍓',
    description: 'Fruitee et legerement sucree, parfaite pour ete',
    ingredients: [
      '400g de fraises fraiches',
      "100ml d'eau",
      '120g de sucre',
      "Jus d'un demi-citron"
    ],
    ingredientItems: [
      { quantity: '400g', item: 'Fraises fraiches', note: 'lavees et equeutees' },
      { quantity: '100ml', item: 'Eau froide' },
      { quantity: '120g', item: 'Sucre' },
      { quantity: '1/2', item: 'Citron (jus)' }
    ],
    proportions: {
      water: '100ml + jus de fraises',
      sugar: '120g',
      flavor: '400g de fraises'
    },
    serves: '4-5 verres',
    garnish: 'Fraise fraiche et menthe',
    tips: [
      'Passe au tamis pour une texture machine plus lisse.',
      'Si tes fraises sont tres sucrees, baisse le sucre a 100g.'
    ],
    machineGuidance: {
      beforeStart: [
        'Mixe fraises + eau + sucre puis filtre les graines.',
        'Ajoute le citron en dernier et goutte avant de verser.'
      ],
      pourAndRun: [
        'Verse dans la cuve propre et seche.',
        'Lance en mode granita et laisse tourner jusqua texture neige humide.',
        'Servir des que la texture est homogene pour un meilleur rendu fruit.'
      ]
    },
    instructions: [
      'Laver et equeuter les fraises',
      "Mixer les fraises avec l'eau et le sucre",
      'Passer au tamis pour retirer les graines',
      'Ajouter le jus de citron',
      'La base est prete pour la machine'
    ],
    time: {
      prep: '20 minutes',
      freezing: '20-30 minutes machine',
      total: '~50 minutes'
    },
    isCustom: false
  },
  {
    id: 'mint',
    name: 'Granita a la Menthe',
    emoji: '🌿',
    description: 'Intense et ultra-fraiche, une explosion de fraicheur',
    ingredients: [
      "500ml d'eau",
      '150g de sucre',
      '1 bouquet de menthe fraiche (30-40 feuilles)',
      "Jus d'un citron vert"
    ],
    ingredientItems: [
      { quantity: '500ml', item: 'Eau froide' },
      { quantity: '150g', item: 'Sucre' },
      { quantity: '30-40 feuilles', item: 'Menthe fraiche' },
      { quantity: '1', item: 'Citron vert (jus)' }
    ],
    proportions: {
      water: '500ml',
      sugar: '150g',
      flavor: '30-40 feuilles de menthe'
    },
    serves: '4 verres',
    garnish: 'Feuille de menthe + rondelle de citron vert',
    tips: [
      'Ne chauffe pas trop longtemps la menthe pour eviter lamertume.',
      'Filtre soigneusement avant cuve pour proteger la turbine.'
    ],
    machineGuidance: {
      beforeStart: [
        "Infuse la menthe dans le sirop chaud 10 a 15 minutes puis filtre.",
        'Ajoute le citron vert une fois la base refroidie.'
      ],
      pourAndRun: [
        'Verse la base froide dans la machine.',
        'Lance le mode granita et surveille les premieres 10 minutes.',
        'Ajuste avec un trait deau froide si la base parait trop dense.'
      ]
    },
    instructions: [
      "Porter l'eau et le sucre a ebullition",
      'Ajouter la menthe et laisser infuser 15 minutes',
      'Filtrer pour retirer les feuilles',
      'Ajouter le jus de citron vert',
      'Refroidir puis verser dans la machine'
    ],
    time: {
      prep: '25 minutes',
      freezing: '20-25 minutes machine',
      total: '~50 minutes'
    },
    isCustom: false
  },
  {
    id: 'almond',
    name: 'Granita aux Amandes',
    emoji: '🥜',
    description: 'Douce et parfumee, la tradition sicilienne authentique',
    ingredients: [
      "500ml d'eau",
      '150g de sucre',
      "100ml de lait d'amandes",
      "1 cuillere a cafe d'extrait d'amandes ameres",
      'Amandes effilees pour la decoration'
    ],
    ingredientItems: [
      { quantity: '500ml', item: 'Eau froide' },
      { quantity: '150g', item: 'Sucre' },
      { quantity: '100ml', item: 'Lait damandes' },
      { quantity: '1 c. a cafe', item: 'Extrait damandes ameres' },
      { quantity: '2 c. a soupe', item: 'Amandes effilees', note: 'pour servir' }
    ],
    proportions: {
      water: '500ml',
      sugar: '150g',
      flavor: "100ml lait d'amandes + extrait"
    },
    serves: '4-5 verres',
    garnish: 'Amandes effilees toastees',
    tips: [
      'Goute avant cuve: lextrait damande peut vite dominer.',
      'Une pincee de sel renforce la saveur amande.'
    ],
    machineGuidance: {
      beforeStart: [
        'Melange lait damandes et extrait dans le sirop froid.',
        'Filtre si des depots apparaissent.'
      ],
      pourAndRun: [
        'Verse dans la cuve en laissant un espace de securite en haut.',
        'Lance le programme granita et verifie la texture apres 20 minutes.',
        'Servez tout de suite puis ajoutez les amandes a la sortie.'
      ]
    },
    instructions: [
      "Porter l'eau et le sucre a ebullition",
      'Laisser refroidir le sirop',
      "Melanger le lait d'amandes et l'extrait",
      'Combiner avec le sirop refroidi',
      'Verser dans la machine'
    ],
    time: {
      prep: '15 minutes',
      freezing: '20-30 minutes machine',
      total: '~45 minutes'
    },
    isCustom: false
  },
  {
    id: 'mojito',
    name: 'Mojito Frozen',
    emoji: '🍹',
    description: 'Le cocktail cubain revisite en version granita, ultra rafraichissant',
    ingredients: [
      "500ml d'eau",
      '150g de sucre',
      '1 bouquet de menthe fraiche',
      '2 citrons verts',
      '100ml de rhum blanc (optionnel)'
    ],
    ingredientItems: [
      { quantity: '500ml', item: 'Eau froide' },
      { quantity: '150g', item: 'Sucre' },
      { quantity: '1 bouquet', item: 'Menthe fraiche' },
      { quantity: '2', item: 'Citrons verts (jus)' },
      { quantity: '100ml', item: 'Rhum blanc', note: 'optionnel, version cocktail' }
    ],
    proportions: {
      water: '500ml',
      sugar: '150g',
      flavor: 'menthe + citron vert + rhum'
    },
    serves: '4 cocktails',
    garnish: 'Branche de menthe + quartier de citron vert',
    tips: [
      'Version sans alcool: remplace le rhum par 80ml deau gazeuse froide.',
      'Ne mixe pas trop longtemps la menthe pour garder de la fraicheur.'
    ],
    notes: ['Recette ideale en aperitif glace.'],
    machineGuidance: {
      beforeStart: [
        'Melange eau + sucre puis laisse refroidir completement.',
        'Mixe menthe + jus de citron vert, puis filtre finement.'
      ],
      pourAndRun: [
        'Assemble la base complete puis verse dans la cuve.',
        'Lance le mode granita et laisse prendre jusqua texture cocktail glace.',
        'Verse dans des verres courts et garnis immediatement.'
      ]
    },
    drinkVisual: {
      emoji: '🍸',
      title: 'Service cocktail',
      subtitle: 'A servir en verre court, menthe fraiche et glace fine'
    },
    instructions: [
      "Porter l'eau et le sucre a ebullition",
      'Laisser refroidir le sirop',
      'Mixer la menthe avec le jus des citrons verts',
      'Filtrer pour retirer les feuilles de menthe',
      'Melanger le sirop, le jus menthe-citron et le rhum',
      'Verser dans la machine'
    ],
    time: {
      prep: '20 minutes',
      freezing: '20-30 minutes machine',
      total: '~50 minutes'
    },
    isCustom: false
  }
];

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
      createdAt: new Date().toISOString()
    };
    setRecipes(prev => [...prev, newRecipe]);
    return newRecipe;
  };

  const deleteCustomRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  return {
    recipes,
    customRecipes,
    addCustomRecipe,
    deleteCustomRecipe
  };
}
