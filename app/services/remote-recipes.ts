import { supabase, isSupabaseConfigured } from '@/app/services/supabase';
import type { Recipe } from '@/app/types/database';
import { parseRemoteRecipeRow, type RemoteRecipeRow } from '@/app/types/remote-recipe';

export async function fetchPublishedRemoteRecipes(): Promise<Recipe[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('recipes')
    .select('id, slug, status, sort_order, recipe, created_at, updated_at')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as RemoteRecipeRow[];
  return rows
    .map(parseRemoteRecipeRow)
    .filter((recipe): recipe is Recipe => recipe !== null);
}
