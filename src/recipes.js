const recipes = {
  lemon: {
    name: 'Granita au Citron',
    emoji: '🍋',
    description: 'Le classique sicilien par excellence, rafraîchissant et acidulé',
    ingredients: [
      '500ml d\'eau',
      '150g de sucre',
      '200ml de jus de citron frais',
      'Zeste d\'un citron bio'
    ],
    proportions: {
      water: '500ml',
      sugar: '150g',
      flavor: '200ml + zeste'
    },
    instructions: [
      'Porter l\'eau et le sucre à ébullition dans une casserole',
      'Laisser refroidir complètement le sirop',
      'Ajouter le jus de citron frais et le zeste râpé',
      'Verser dans un plat peu profond et large',
      'Placer au congélateur pendant 30 minutes',
      'Gratter la surface avec une fourchette pour créer des cristaux',
      'Répéter l\'opération toutes les 30 minutes pendant 3-4 heures',
      'Servir immédiatement dans des verres frais'
    ],
    time: {
      prep: '15 minutes',
      freezing: '3-4 heures',
      total: '~4 heures'
    }
  },
  coffee: {
    name: 'Granita au Café',
    emoji: '☕',
    description: 'Version sicilienne du café frappé, intense et revigorante',
    ingredients: [
      '500ml d\'eau',
      '150g de sucre',
      '200ml de café expresso fort',
      '1 cuillère à café de cacao en poudre (optionnel)'
    ],
    proportions: {
      water: '500ml',
      sugar: '150g',
      flavor: '200ml de café'
    },
    instructions: [
      'Préparer le café expresso et le laisser refroidir',
      'Porter l\'eau et le sucre à ébullition',
      'Mélanger le sirop refroidi avec le café',
      'Ajouter le cacao si désiré',
      'Verser dans un plat peu profond',
      'Congeler 30 minutes puis gratter avec une fourchette',
      'Répéter toutes les 30 minutes pendant 3 heures',
      'Servir avec de la crème fouettée (optionnel)'
    ],
    time: {
      prep: '20 minutes',
      freezing: '3 heures',
      total: '~3h30'
    }
  },
  strawberry: {
    name: 'Granita à la Fraise',
    emoji: '🍓',
    description: 'Fruitée et légèrement sucrée, parfaite pour l\'été',
    ingredients: [
      '400g de fraises fraîches',
      '100ml d\'eau',
      '120g de sucre',
      'Jus d\'un demi-citron'
    ],
    proportions: {
      water: '100ml + jus de fraises',
      sugar: '120g',
      flavor: '400g de fraises'
    },
    instructions: [
      'Laver et équeuter les fraises',
      'Mixer les fraises avec l\'eau et le sucre',
      'Passer au tamis pour retirer les graines',
      'Ajouter le jus de citron',
      'Verser dans un plat peu profond',
      'Congeler et gratter toutes les 30 minutes',
      'Répéter pendant 3-4 heures',
      'Servir avec des feuilles de menthe fraîche'
    ],
    time: {
      prep: '20 minutes',
      freezing: '3-4 heures',
      total: '~4 heures'
    }
  },
  mint: {
    name: 'Granita à la Menthe',
    emoji: '🌿',
    description: 'Intense et ultra-fraîche, une explosion de fraîcheur',
    ingredients: [
      '500ml d\'eau',
      '150g de sucre',
      '1 bouquet de menthe fraîche (30-40 feuilles)',
      'Jus d\'un citron vert'
    ],
    proportions: {
      water: '500ml',
      sugar: '150g',
      flavor: '30-40 feuilles de menthe'
    },
    instructions: [
      'Porter l\'eau et le sucre à ébullition',
      'Ajouter la menthe et laisser infuser 15 minutes',
      'Filtrer pour retirer les feuilles',
      'Ajouter le jus de citron vert',
      'Laisser refroidir complètement',
      'Verser dans un plat et congeler',
      'Gratter toutes les 30 minutes pendant 3 heures',
      'Servir avec une feuille de menthe décorative'
    ],
    time: {
      prep: '25 minutes',
      freezing: '3 heures',
      total: '~3h30'
    }
  },
  almond: {
    name: 'Granita aux Amandes',
    emoji: '🥜',
    description: 'Douce et parfumée, la tradition sicilienne authentique',
    ingredients: [
      '500ml d\'eau',
      '150g de sucre',
      '100ml de lait d\'amandes',
      '1 cuillère à café d\'extrait d\'amandes amères',
      'Amandes effilées pour la décoration'
    ],
    proportions: {
      water: '500ml',
      sugar: '150g',
      flavor: '100ml lait d\'amandes + extrait'
    },
    instructions: [
      'Porter l\'eau et le sucre à ébullition',
      'Laisser refroidir le sirop',
      'Mélanger le lait d\'amandes et l\'extrait',
      'Combiner avec le sirop refroidi',
      'Verser dans un plat peu profond',
      'Congeler et gratter toutes les 30 minutes',
      'Répéter pendant 3-4 heures',
      'Servir saupoudré d\'amandes effilées'
    ],
    time: {
      prep: '15 minutes',
      freezing: '3-4 heures',
      total: '~4 heures'
    }
  }
};

module.exports = recipes;
