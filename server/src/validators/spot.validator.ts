// Règles de validation côté serveur, avec Zod.
// Le serveur ne fait JAMAIS confiance aux données reçues : même si le
// formulaire React vérifie déjà les champs, une requête peut être envoyée
// directement (curl, Postman...) sans passer par le formulaire.
import { z } from 'zod';
import { HttpError } from '../middleware/httpError.js';

// Corps attendu pour POST /api/spots et PUT /api/spots/:id.
// strictObject : tout champ non prévu est refusé (HTTP 400).
export const spotBodySchema = z.strictObject({
  // --- Table spots ---
  name: z
    .string('Le nom est obligatoire')
    .trim()
    .min(1, 'Le nom est obligatoire')
    .max(150, 'Le nom ne doit pas dépasser 150 caractères'),
  category_id: z
    .number('La catégorie est obligatoire')
    .int('La catégorie doit être un identifiant entier')
    .positive('La catégorie doit être un identifiant positif'),
  description: z
    .string('La description doit être un texte')
    .trim()
    .max(1000, 'La description ne doit pas dépasser 1000 caractères')
    .nullable()
    .optional(),
  images: z
    .array(
      z.url({ protocol: /^https?$/, message: 'Chaque image doit être une URL valide en http ou https' }),
      'Les images doivent être une liste d\'URL',
    )
    .max(6, '6 images maximum')
    .default([]),
  available: z.boolean('La disponibilité doit être true ou false').default(true),

  // --- Table spot_infos ---
  address: z
    .string("L'adresse doit être un texte")
    .trim()
    .max(255, "L'adresse ne doit pas dépasser 255 caractères")
    .nullable()
    .optional(),
  city: z
    .string('La ville est obligatoire')
    .trim()
    .min(1, 'La ville est obligatoire')
    .max(100, 'La ville ne doit pas dépasser 100 caractères'),
  latitude: z
    .number('La latitude est obligatoire')
    .min(-90, 'La latitude doit être comprise entre -90 et 90')
    .max(90, 'La latitude doit être comprise entre -90 et 90'),
  longitude: z
    .number('La longitude est obligatoire')
    .min(-180, 'La longitude doit être comprise entre -180 et 180')
    .max(180, 'La longitude doit être comprise entre -180 et 180'),
}, 'Le corps de la requête doit être un objet JSON');

// Corps attendu pour PATCH /api/spots/:id/availability
export const availabilitySchema = z.strictObject(
  { available: z.boolean('available doit être true ou false') },
  'Le corps de la requête doit être un objet JSON',
);

// Type TypeScript déduit automatiquement du schéma ci-dessus :
// c'est la forme des données APRÈS validation.
export type SpotInput = z.infer<typeof spotBodySchema>;

// Identifiant dans l'URL (/api/spots/:id) : entier positif uniquement.
// "abc", "0", "-3" ou "1.5" sont refusés avec HTTP 400.
export function parseId(value: string): number {
  if (!/^[1-9][0-9]*$/.test(value)) {
    throw new HttpError(400, 'Validation failed', [
      { field: 'id', message: "L'identifiant doit être un entier positif" },
    ]);
  }
  return Number(value);
}
