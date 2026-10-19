import type { PostgrestError } from '@supabase/supabase-js';
import { HttpError } from '../middleware/httpError.js';

// Traduit une erreur renvoyée par Supabase (PostgreSQL) en erreur HTTP.
export function toHttpError(error: PostgrestError): HttpError {
  // 23503 = violation de clé étrangère : category_id ne correspond à aucune catégorie
  if (error.code === '23503') {
    return new HttpError(400, 'Validation failed', [
      { field: 'category_id', message: "Cette catégorie n'existe pas" },
    ]);
  }

  // Autre erreur de base : on garde le détail dans les logs du serveur,
  // le client reçoit seulement un message générique.
  console.error('Erreur Supabase :', error.code, error.message);
  return new HttpError(500, 'Erreur de base de données');
}
