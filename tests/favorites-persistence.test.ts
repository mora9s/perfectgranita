import test from 'node:test';
import assert from 'node:assert/strict';

import { parseFavoriteRecipeIds, sanitizeFavoriteRecipeIds } from '../app/hooks/favorites-persistence';

test('parseFavoriteRecipeIds parses and deduplicates valid ids', () => {
  const parsed = parseFavoriteRecipeIds(JSON.stringify(['r1', 'r2', 'r1', 123, null]));

  assert.deepEqual(parsed, ['r1', 'r2']);
});

test('parseFavoriteRecipeIds handles empty values and rejects invalid payloads', () => {
  assert.deepEqual(parseFavoriteRecipeIds(null), []);
  assert.deepEqual(parseFavoriteRecipeIds(''), []);

  assert.throws(() => parseFavoriteRecipeIds('{broken-json'), /Could not parse persisted favorite recipes/);
  assert.throws(() => parseFavoriteRecipeIds(JSON.stringify({ ids: [] })), /payload must be an array/);
});

test('sanitizeFavoriteRecipeIds removes duplicates and empty ids', () => {
  const sanitized = sanitizeFavoriteRecipeIds(['r1', '', 'r2', 'r1']);
  assert.deepEqual(sanitized, ['r1', 'r2']);
});
