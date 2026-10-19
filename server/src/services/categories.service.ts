// Lecture des catégories (table de référence, en lecture seule dans l'application).
import { supabase } from '../config/supabase.js';
import type { Category } from '../types/spot.js';
import { toHttpError } from './supabaseError.js';

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('id, name, icon, color').order('name');

  if (error) throw toHttpError(error);
  return data;
}
