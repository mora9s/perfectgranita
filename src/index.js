#!/usr/bin/env node

const { Command } = require('commander');
const recipes = require('./recipes');

const program = new Command();

// Couleurs ANSI
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  red: '\x1b[31m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

program
  .name('perfectgranita')
  .description('Un générateur de recettes de granita sicilien')
  .version('1.0.0');

program
  .command('list')
  .description('Lister toutes les saveurs de granita disponibles')
  .action(() => {
    console.log('\n' + colorize('🍧 Saveurs de Granita Disponibles', 'bright') + '\n');
    console.log(colorize('=' .repeat(40), 'cyan'));
    
    Object.keys(recipes).forEach((key, index) => {
      const recipe = recipes[key];
      console.log(`\n  ${colorize(`${index + 1}.`, 'yellow')} ${colorize(recipe.emoji, 'bright')} ${colorize(recipe.name, 'bright')}`);
      console.log(`     ${colorize('ID:', 'cyan')} ${key}`);
      console.log(`     ${colorize('Description:', 'cyan')} ${recipe.description}`);
    });
    
    console.log('\n' + colorize('=' .repeat(40), 'cyan'));
    console.log(colorize('\nUtilisez "perfectgranita recipe <id>" pour voir la recette\n', 'green'));
  });

program
  .command('recipe <flavor>')
  .description('Afficher la recette d\'une saveur spécifique')
  .action((flavor) => {
    const recipe = recipes[flavor.toLowerCase()];
    
    if (!recipe) {
      console.log(colorize(`\n❌ Erreur: La saveur "${flavor}" n'existe pas.`, 'red'));
      console.log(colorize('Utilisez "perfectgranita list" pour voir les saveurs disponibles.\n', 'yellow'));
      process.exit(1);
    }
    
    console.log('\n' + colorize(`${recipe.emoji} ${recipe.name.toUpperCase()}`, 'bright'));
    console.log(colorize('═'.repeat(50), 'cyan'));
    console.log(`\n${colorize('Description:', 'yellow')} ${recipe.description}`);
    
    console.log(`\n${colorize('📋 INGRÉDIENTS', 'bright')}`);
    console.log(colorize('-'.repeat(30), 'cyan'));
    recipe.ingredients.forEach(ing => {
      console.log(`  • ${ing}`);
    });
    
    console.log(`\n${colorize('⚖️  PROPORTIONS', 'bright')}`);
    console.log(colorize('-'.repeat(30), 'cyan'));
    console.log(`  Eau: ${recipe.proportions.water}`);
    console.log(`  Sucre: ${recipe.proportions.sugar}`);
    console.log(`  Arôme principal: ${recipe.proportions.flavor}`);
    
    console.log(`\n${colorize('📝 INSTRUCTIONS', 'bright')}`);
    console.log(colorize('-'.repeat(30), 'cyan'));
    recipe.instructions.forEach((step, index) => {
      console.log(`  ${colorize(`${index + 1}.`, 'yellow')} ${step}`);
    });
    
    console.log(`\n${colorize('⏱️  TEMPS', 'bright')}`);
    console.log(colorize('-'.repeat(30), 'cyan'));
    console.log(`  Préparation: ${recipe.time.prep}`);
    console.log(`  Congélation: ${recipe.time.freezing}`);
    console.log(`  Total: ${recipe.time.total}`);
    
    console.log('\n' + colorize('═'.repeat(50), 'cyan'));
    console.log(colorize('Bon appétit ! 🍧\n', 'green'));
  });

program.parse();
