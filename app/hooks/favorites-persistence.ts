export function parseFavoriteRecipeIds(rawPayload: string | null): string[] {
  if (!rawPayload) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawPayload);
  } catch {
    throw new Error('Could not parse persisted favorite recipes');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Persisted favorite recipes payload must be an array');
  }

  const ids = parsed.filter((entry): entry is string => typeof entry === 'string');
  return Array.from(new Set(ids));
}

export function sanitizeFavoriteRecipeIds(ids: string[]): string[] {
  return Array.from(new Set(ids.filter((entry) => typeof entry === 'string' && entry.length > 0)));
}
