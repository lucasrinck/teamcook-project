import type { ZodError } from 'zod';
import type { FieldError } from '../types/spot.js';

// Transforme une erreur Zod en liste { field, message } lisible par le frontend.
export function formatZodError(error: ZodError): FieldError[] {
  return error.issues.map((issue) => {
    // Champ non autorisé dans le corps (schéma strict)
    if (issue.code === 'unrecognized_keys') {
      return { field: issue.keys.join(', '), message: `Champ non autorisé : ${issue.keys.join(', ')}` };
    }
    // ex. ["images", 2] -> "images.2"
    const field = issue.path.length > 0 ? issue.path.join('.') : 'body';
    return { field, message: issue.message };
  });
}
