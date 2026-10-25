import type { Request, Response } from 'express';
// La connexion à Supabase, créée une seule fois dans config/supabase.ts
import { supabase } from '../config/supabase.js';

// GET /api/categories -> 200 + liste des catégories (filtres et formulaire admin)
// "async" permet d'utiliser "await" : attendre la réponse de Supabase avant de continuer.
export async function getCategories(req: Request, res: Response) {
  // On demande à Supabase :
  // - from('categories') : la table categories
  // - select(...)        : seulement ces 4 colonnes
  // - order('name')      : triées par nom, de A à Z
  // Supabase renvoie toujours un objet { data, error } : data = les lignes, error = l'erreur éventuelle.
  // "const { data, error } = ..." range ces deux valeurs dans deux variables du même nom.
  const { data, error } = await supabase.from('categories').select('id, name, icon, color').order('name');

  // Si Supabase a renvoyé une erreur (error n'est pas null)
  if (error) {
    // Le détail s'affiche dans le terminal du serveur...
    console.error(error);
    // ...et le navigateur reçoit seulement un message général avec le code 500 (erreur serveur)
    res.status(500).json({ error: 'Erreur de base de données' });
    return;
  }
  // Tout s'est bien passé : on renvoie la liste avec le code 200 (OK)
  res.status(200).json(data);
}
