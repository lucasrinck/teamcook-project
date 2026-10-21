import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

// GET /api/categories -> 200 + liste des catégories (filtres et formulaire admin)
export async function getCategories(req: Request, res: Response) {
  const { data, error } = await supabase.from('categories').select('id, name, icon, color').order('name');

  if (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur de base de données' });
    return;
  }
  res.status(200).json(data);
}
