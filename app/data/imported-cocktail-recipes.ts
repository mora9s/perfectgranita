import type { Recipe, RecipeAlcoholCategory, RecipeIngredient } from '@/app/types/database';

const DEFAULT_SLUSHI_STEPS: string[] = [
  'Refroidir tous les liquides entre 4C et 8C avant de melanger.',
  'Tout doit etre liquide: pas de glacons, pas de morceaux solides.',
  'Verser dans la cuve jusqua 1890 ml max.',
  'Lancer le programme Cocktail glace.',
  'Ajuster la texture en laissant tourner quelques minutes de plus si necessaire.'
];

const DEFAULT_SLUSHI_MAX_STEPS: string[] = [
  'Refroidir tous les liquides entre 4C et 8C avant de melanger.',
  'Tout doit etre liquide: pas de glacons, pas de morceaux solides.',
  'Verser dans la cuve jusqua 3310 ml max.',
  'Lancer Frozen Cocktail (Frozen Cocktail Max uniquement si recette >16% ABV).',
  'Attendre la texture souhaitee puis servir immediatement.'
];

function ingredient(
  item: string,
  slushiMl: number,
  slushiMaxMl: number,
  options?: { note?: string; abvPercent?: number }
): RecipeIngredient {
  return {
    quantity: `${slushiMl} ml / ${slushiMaxMl} ml`,
    item,
    note: options?.note,
    volumesMl: {
      slushi: slushiMl,
      'slushi-max': slushiMaxMl,
    },
    abvPercent: options?.abvPercent,
  };
}

function machineProfiles(abv: number, options?: { maxProgram?: string; maxTime?: string }): Recipe['machineProfiles'] {
  const maxProgram = options?.maxProgram ?? 'Frozen Cocktail';
  const maxTime = options?.maxTime ?? '~20-40 min';

  return {
    slushi: {
      machineProgram: 'Cocktail glace',
      fillVolumeMl: 1890,
      estimatedRunTime: '~55 min (batch plein)',
      estimatedAbvPercent: abv,
      steps: DEFAULT_SLUSHI_STEPS,
    },
    'slushi-max': {
      machineProgram: maxProgram,
      fillVolumeMl: 3310,
      estimatedRunTime: maxTime,
      estimatedAbvPercent: abv,
      steps: DEFAULT_SLUSHI_MAX_STEPS,
    },
  };
}

function cocktailRecipe(input: {
  id: string;
  name: string;
  emoji: string;
  description: string;
  abv: number;
  garnish: string;
  alcoholCategory: RecipeAlcoholCategory;
  usesMonin?: boolean;
  notes?: string[];
  image?: any;
  ingredients: RecipeIngredient[];
}): Recipe {
  return {
    id: input.id,
    name: input.name,
    emoji: input.emoji,
    description: input.description,
    ingredients: input.ingredients.map((item) => item.item),
    ingredientItems: input.ingredients,
    proportions: {
      water: 'Voir volumes par machine',
      sugar: 'Sirops/jus sucres requis (>=5 g/100 ml)',
      flavor: 'Cocktail alcoolise',
    },
    serves: 'Slushi: 7-8 verres | Slushi Max: ~12 verres',
    garnish: input.garnish,
    alcoholCategory: input.alcoholCategory,
    usesMonin: input.usesMonin ?? false,
    notes: input.notes,
    machineProfiles: machineProfiles(input.abv),
    media: {
      image: input.image,
      imageAlt: `Photo de service pour ${input.name}`,
    },
    instructions: [
      'Mesurer chaque ingredient liquide avec precision.',
      'Melanger dans un pichet jusqua obtenir une base homogene.',
      'Verser dans la machine selectionnee et lancer le programme cocktail.',
      'Servir des que la texture granita est stable.',
    ],
    time: {
      prep: '~5-10 min',
      freezing: 'Slushi ~50 min | Slushi Max ~15-40 min',
      total: 'Slushi ~55 min | Slushi Max ~20-40 min',
    },
    isCustom: false,
  };
}

export const importedCocktailRecipes: Recipe[] = [
  cocktailRecipe({
    id: 'a1-margarita',
    name: 'Margarita classique (slush)',
    emoji: '🍋',
    description: 'Tequila + liqueur orange + citron vert, diluee pour texture slush stable.',
    abv: 8.3,
    garnish: 'Bord sel + quartier de citron vert',
    alcoholCategory: 'tequila',
    image: require('@/assets/images/margarita-frozen.jpg'),
    ingredients: [
      ingredient('Tequila blanco (40%)', 260, 455, { abvPercent: 40 }),
      ingredient('Liqueur orange type triple sec (40%)', 130, 230, { abvPercent: 40 }),
      ingredient('Jus de citron vert', 220, 385),
      ingredient('Sirop de sucre 1:1', 160, 280),
      ingredient('Eau froide', 1120, 1960),
    ],
  }),
  cocktailRecipe({
    id: 'a2-daiquiri',
    name: 'Daiquiri citron vert (slush)',
    emoji: '🍈',
    description: 'Rhum blanc, citron vert et sirop, avec dilution controlee.',
    abv: 7.6,
    garnish: 'Zeste de citron vert',
    alcoholCategory: 'rhum',
    image: require('@/assets/images/daiquiri-lime.jpg'),
    ingredients: [
      ingredient('Rhum blanc (40%)', 360, 630, { abvPercent: 40 }),
      ingredient('Jus de citron vert', 260, 455),
      ingredient('Sirop de sucre 1:1', 200, 350),
      ingredient('Eau froide', 1070, 1875),
    ],
  }),
  cocktailRecipe({
    id: 'a3-vodka-lemonade',
    name: 'Vodka lemonade glacee',
    emoji: '🍋',
    description: 'Version hard lemonade avec limonade non light.',
    abv: 7.6,
    garnish: 'Rondelle de citron',
    alcoholCategory: 'vodka',
    ingredients: [
      ingredient('Vodka (40%)', 360, 630, { abvPercent: 40 }),
      ingredient('Jus de citron jaune', 180, 315),
      ingredient('Limonade non light', 950, 1665),
      ingredient('Eau froide', 400, 700),
    ],
  }),
  cocktailRecipe({
    id: 'a4-moscow-mule',
    name: 'Moscow Mule (slush)',
    emoji: '🫚',
    description: 'Vodka, ginger beer et citron vert en version granita.',
    abv: 6.8,
    garnish: 'Menthe + tranche de citron vert',
    alcoholCategory: 'vodka',
    image: require('@/assets/images/moscow-mule.jpg'),
    ingredients: [
      ingredient('Vodka (40%)', 320, 560, { abvPercent: 40 }),
      ingredient('Ginger beer non light', 1100, 1925),
      ingredient('Jus de citron vert', 160, 280),
      ingredient('Sirop de sucre 1:1', 110, 190),
      ingredient('Eau froide', 200, 355),
    ],
  }),
  cocktailRecipe({
    id: 'a5-gin-tonic',
    name: 'Gin tonic (slush)',
    emoji: '🍸',
    description: 'Profil sec et herbacé, legerement adouci.',
    abv: 6.8,
    garnish: 'Zeste de citron vert ou pamplemousse',
    alcoholCategory: 'gin',
    ingredients: [
      ingredient('Gin (40%)', 320, 560, { abvPercent: 40 }),
      ingredient('Tonic non light', 1250, 2190),
      ingredient('Jus de citron vert', 120, 210),
      ingredient('Sirop de sucre 1:1', 80, 140),
      ingredient('Eau froide', 120, 210),
    ],
  }),
  cocktailRecipe({
    id: 'a6-paloma',
    name: 'Paloma pamplemousse (slush)',
    emoji: '🍊',
    description: 'Tequila et pamplemousse, structure diluee pour machine.',
    abv: 6.8,
    garnish: 'Tranche de pamplemousse, bord sel optionnel',
    alcoholCategory: 'tequila',
    ingredients: [
      ingredient('Tequila (40%)', 320, 560, { abvPercent: 40 }),
      ingredient('Jus de pamplemousse', 900, 1575),
      ingredient('Soda pamplemousse non light', 450, 790),
      ingredient('Jus de citron vert', 120, 210),
      ingredient('Sirop de sucre 1:1', 100, 175),
    ],
  }),
  cocktailRecipe({
    id: 'a7-pina-colada-classic',
    name: 'Pina colada classique',
    emoji: '🥥',
    description: 'Version coco/ananas sans sirop Monin.',
    abv: 6.3,
    garnish: 'Ananas frais (hors machine)',
    alcoholCategory: 'rhum',
    ingredients: [
      ingredient('Rhum blanc (40%)', 300, 525, { abvPercent: 40 }),
      ingredient('Jus d ananas', 900, 1575),
      ingredient('Lait de coco liquide', 420, 735),
      ingredient('Sirop de sucre 1:1', 120, 210),
      ingredient('Eau froide', 150, 265),
    ],
  }),
  cocktailRecipe({
    id: 'a8-espresso-martini',
    name: 'Espresso Martini (slush)',
    emoji: '☕',
    description: 'Vodka + liqueur de cafe + cafe froid.',
    abv: 8.3,
    garnish: 'Poudre cacao ou grains de cafe',
    alcoholCategory: 'vodka',
    image: require('@/assets/images/espresso-martini.jpg'),
    ingredients: [
      ingredient('Vodka (40%)', 280, 490, { abvPercent: 40 }),
      ingredient('Liqueur de cafe (20%)', 220, 385, { abvPercent: 20 }),
      ingredient('Cafe froid', 900, 1575),
      ingredient('Sirop de sucre 1:1', 120, 210),
      ingredient('Eau froide', 370, 650),
    ],
  }),
  cocktailRecipe({
    id: 'a9-spritz-glace',
    name: 'Spritz glace (Aperol + Prosecco)',
    emoji: '🍹',
    description: 'Aperol, prosecco et orange, ajuste pour texture granita.',
    abv: 6.7,
    garnish: 'Tranche d orange',
    alcoholCategory: 'aperol-prosecco',
    notes: ['ABV calcule avec Aperol 12,5% et Prosecco 11%.'],
    ingredients: [
      ingredient('Aperol (12.5%)', 400, 700, { abvPercent: 12.5 }),
      ingredient('Prosecco (11%)', 700, 1225, { abvPercent: 11 }),
      ingredient('Eau gazeuse', 250, 440),
      ingredient('Jus d orange', 400, 700),
      ingredient('Eau froide', 140, 245),
    ],
  }),
  cocktailRecipe({
    id: 'a10-tequila-sunrise',
    name: 'Tequila Sunrise (slush)',
    emoji: '🌅',
    description: 'Tequila, orange et grenadine.',
    abv: 6.8,
    garnish: 'Quartier d orange',
    alcoholCategory: 'tequila',
    ingredients: [
      ingredient('Tequila (40%)', 320, 560, { abvPercent: 40 }),
      ingredient('Jus d orange', 950, 1665),
      ingredient('Sirop grenadine', 120, 210),
      ingredient('Eau froide', 500, 875),
    ],
  }),
  cocktailRecipe({
    id: 'a11-cosmopolitan',
    name: 'Cosmopolitan (slush)',
    emoji: '🍸',
    description: 'Vodka, liqueur orange, cranberry et citron vert.',
    abv: 8.3,
    garnish: 'Zeste d orange',
    alcoholCategory: 'mixte',
    ingredients: [
      ingredient('Vodka (40%)', 260, 455, { abvPercent: 40 }),
      ingredient('Liqueur orange (40%)', 130, 230, { abvPercent: 40 }),
      ingredient('Jus cranberry', 600, 1050),
      ingredient('Jus de citron vert', 120, 210),
      ingredient('Sirop de sucre 1:1', 100, 175),
      ingredient('Eau froide', 680, 1190),
    ],
  }),
  cocktailRecipe({
    id: 'a12-rum-cola',
    name: 'Rum & Cola (slush)',
    emoji: '🥃',
    description: 'Rhum et cola non light, simple et efficace.',
    abv: 6.8,
    garnish: 'Citron vert + cerise cocktail optionnelle',
    alcoholCategory: 'rhum',
    ingredients: [
      ingredient('Rhum (40%)', 320, 560, { abvPercent: 40 }),
      ingredient('Cola non light', 1200, 2100),
      ingredient('Jus de citron vert', 120, 210),
      ingredient('Sirop de sucre 1:1', 60, 105),
      ingredient('Eau froide', 190, 335),
    ],
  }),
  cocktailRecipe({
    id: 'b1-pina-colada-monin-official',
    name: 'Pina Colada (Monin) - officielle',
    emoji: '🍍',
    description: 'Version co-brandee Ninja x Monin.',
    abv: 6.0,
    garnish: 'Ananas + coco rapee (hors machine)',
    alcoholCategory: 'rhum',
    usesMonin: true,
    ingredients: [
      ingredient('Sirop Monin Pina Colada', 189, 330),
      ingredient('Jus d ananas', 945, 1655),
      ingredient('Lait de coco liquide', 472, 825),
      ingredient('Rhum blanc cubain (40%)', 284, 500, { abvPercent: 40 }),
    ],
  }),
  cocktailRecipe({
    id: 'b2-pina-colada-monin-sans-lactose',
    name: 'Pina Colada (Monin) - sans lactose',
    emoji: '🥥',
    description: 'Variante Monin sans lait de coco.',
    abv: 6.0,
    garnish: 'Ananas',
    alcoholCategory: 'rhum',
    usesMonin: true,
    ingredients: [
      ingredient('Sirop Monin Pina Colada', 284, 500),
      ingredient('Jus d ananas', 1323, 2315),
      ingredient('Rhum blanc cubain (40%)', 284, 500, { abvPercent: 40 }),
    ],
  }),
  cocktailRecipe({
    id: 'b3-red-spritz-monin',
    name: 'Red Spritz (Monin)',
    emoji: '🍓',
    description: 'Fraise des bois + Aperol + Prosecco.',
    abv: 5.8,
    garnish: 'Tranche d orange',
    alcoholCategory: 'aperol-prosecco',
    notes: ['Base inspiree recette officielle Ninja x Monin.'],
    ingredients: [
      ingredient('Sirop Monin Fraise des bois', 284, 500),
      ingredient('Aperol (12.5%)', 378, 660, { abvPercent: 12.5 }),
      ingredient('Prosecco (11%)', 567, 995, { abvPercent: 11 }),
      ingredient('Jus d orange', 472, 825),
      ingredient('Eau plate', 189, 330),
    ],
  }),
  cocktailRecipe({
    id: 'b4-frose-monin',
    name: 'Frose (Monin Fraise des bois + rose)',
    emoji: '🌸',
    description: 'Fraise des bois et vin rose (ABV dependant du vin).',
    abv: 7.8,
    garnish: 'Fraise + citron vert (hors machine)',
    alcoholCategory: 'vin',
    usesMonin: true,
    notes: [
      'ABV reel dependant du degre du vin rose utilise.',
      'Approximation rapport: ABV final ~= 0,65 x ABV du vin rose.'
    ],
    ingredients: [
      ingredient('Sirop Monin Fraise des bois', 378, 660),
      ingredient('Vin rose', 1229, 2155, { note: 'Utiliser le degre reel de la bouteille pour recalcul ABV.' }),
      ingredient('Eau plate', 283, 495),
    ],
  }),
  cocktailRecipe({
    id: 'b5-movie-cola-monin-rum',
    name: 'Movie Cola (Monin) - version rhum',
    emoji: '🍿',
    description: 'Cola + Popcorn Monin avec rhum blanc.',
    abv: 6.8,
    garnish: 'Citron vert + popcorn (hors machine)',
    alcoholCategory: 'rhum',
    usesMonin: true,
    ingredients: [
      ingredient('Sirop Monin Cola', 250, 440),
      ingredient('Sirop Monin Popcorn', 80, 140),
      ingredient('Rhum blanc (40%)', 320, 560, { abvPercent: 40 }),
      ingredient('Eau plate', 1240, 2170),
    ],
  }),
  cocktailRecipe({
    id: 'b6-bubble-gum-lemonade-monin-vodka',
    name: 'Bubble Gum Citronnade (Monin) - vodka',
    emoji: '🍬',
    description: 'Cloudy Lemonade + Bubble Gum + vodka.',
    abv: 6.8,
    garnish: 'Citron jaune',
    alcoholCategory: 'vodka',
    usesMonin: true,
    ingredients: [
      ingredient('Concentre Monin Cloudy Lemonade', 250, 440),
      ingredient('Sirop Monin Bubble Gum', 80, 140),
      ingredient('Vodka (40%)', 320, 560, { abvPercent: 40 }),
      ingredient('Eau plate', 1240, 2170),
    ],
  }),
  cocktailRecipe({
    id: 'b7-pomme-framboise-cassis-monin-gin',
    name: 'Pomme-Framboise-Cassis (Monin) - gin',
    emoji: '🍏',
    description: 'The framboise, cassis, pomme verte et gin.',
    abv: 6.8,
    garnish: 'Framboise + citron vert',
    alcoholCategory: 'gin',
    usesMonin: true,
    ingredients: [
      ingredient('Concentre Monin The Framboise', 190, 335),
      ingredient('Fruit Monin Cassis', 190, 335),
      ingredient('Pure by Monin Pomme verte', 95, 165),
      ingredient('Gin (40%)', 320, 560, { abvPercent: 40 }),
      ingredient('Eau plate', 1095, 1915),
    ],
  }),
  cocktailRecipe({
    id: 'b8-garden-monin-gin',
    name: 'Garden (Monin) - version gin',
    emoji: '🥒',
    description: 'Concombre, fleur de sureau, jus de pomme et gin.',
    abv: 6.8,
    garnish: 'Ruban de concombre',
    alcoholCategory: 'gin',
    usesMonin: true,
    ingredients: [
      ingredient('Pure by Monin Concombre', 160, 280),
      ingredient('Sirop Monin Fleur de sureau', 160, 280),
      ingredient('Gin (40%)', 320, 560, { abvPercent: 40 }),
      ingredient('Jus de pomme', 1050, 1835),
      ingredient('Eau plate', 200, 355),
    ],
  }),
  cocktailRecipe({
    id: 'b9-tiki-taka-monin-rum',
    name: 'Tiki Taka (Monin) - version rhum',
    emoji: '🏝️',
    description: 'Passion, gingembre et ananas avec rhum blanc.',
    abv: 6.8,
    garnish: 'Tete de menthe + citron vert',
    alcoholCategory: 'rhum',
    usesMonin: true,
    ingredients: [
      ingredient('Sirop Monin Passion', 120, 210),
      ingredient('Concentre Monin Gingembre', 40, 70),
      ingredient('Rhum blanc (40%)', 320, 560, { abvPercent: 40 }),
      ingredient('Jus d ananas', 1410, 2470),
    ],
  }),
  cocktailRecipe({
    id: 'b10-orange-spritz-fraise-monin-vodka',
    name: 'Orange Spritz & Fraise (Monin) - vodka',
    emoji: '🍊',
    description: 'Orange Spritz Monin + Fraise des bois + vodka.',
    abv: 6.8,
    garnish: 'Orange + fraise',
    alcoholCategory: 'vodka',
    usesMonin: true,
    ingredients: [
      ingredient('Sirop Monin Orange Spritz', 250, 440),
      ingredient('Sirop Monin Fraise des bois', 170, 300),
      ingredient('Vodka (40%)', 320, 560, { abvPercent: 40 }),
      ingredient('Eau plate', 1150, 2010),
    ],
  }),
];

export const importedCocktailRecipeCount = importedCocktailRecipes.length;
