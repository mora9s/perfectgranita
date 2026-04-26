import test from 'node:test';
import assert from 'node:assert/strict';

import { mergeImportedAndCustomRecipes, parseCustomRecipes } from '../app/hooks/recipe-persistence';
import type { CustomRecipe, Recipe } from '../app/types/database';

const builtInRecipe: Recipe = {
  id: 'builtin-1',
  name: 'Built-in',
  emoji: '🍸',
  description: 'Built-in recipe',
  ingredients: ['Water'],
  proportions: {
    water: '1',
    sugar: '1',
    flavor: '1',
  },
  instructions: ['Mix'],
  time: {
    prep: '1m',
    freezing: '1m',
    total: '2m',
  },
  isCustom: false,
};

const customRecipe: CustomRecipe = {
  ...builtInRecipe,
  id: 'custom-1',
  name: 'Custom',
  isCustom: true,
  createdAt: '2026-04-26T10:00:00.000Z',
};

test('mergeImportedAndCustomRecipes keeps built-ins and appends valid custom recipes', () => {
  const merged = mergeImportedAndCustomRecipes([builtInRecipe], [customRecipe]);
  assert.equal(merged.length, 2);
  assert.equal(merged[0]?.id, 'builtin-1');
  assert.equal(merged[1]?.id, 'custom-1');
});

test('parseCustomRecipes ignores malformed entries but reports corrupt payloads', () => {
  const parsed = parseCustomRecipes(
    JSON.stringify([
      customRecipe,
      { id: 'broken', isCustom: true },
      { id: 'not-custom', isCustom: false },
    ]),
  );

  assert.equal(parsed.length, 1);
  assert.equal(parsed[0]?.id, 'custom-1');
  assert.throws(() => parseCustomRecipes('{broken-json'), /Could not parse persisted custom recipes/);
  assert.throws(() => parseCustomRecipes(JSON.stringify({ recipes: [] })), /payload must be an array/);
});

test('mergeImportedAndCustomRecipes ignores custom recipes colliding with built-in ids', () => {
  const collidingCustomRecipe: CustomRecipe = {
    ...customRecipe,
    id: builtInRecipe.id,
    name: 'Should not replace built-in',
  };

  const merged = mergeImportedAndCustomRecipes([builtInRecipe], [collidingCustomRecipe, customRecipe]);

  assert.equal(merged.length, 2);
  assert.equal(merged[0]?.id, 'builtin-1');
  assert.equal(merged[0]?.name, 'Built-in');
  assert.equal(merged[1]?.id, 'custom-1');
});
