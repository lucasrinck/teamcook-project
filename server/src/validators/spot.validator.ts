// Validation côté serveur des données d'un lieu (POST et PUT).
// Le serveur ne fait jamais confiance au formulaire : une requête peut
// arriver sans passer par le site (curl, Postman...).
import type { FieldError } from '../types/spot.js';

// Vérifie le corps de la requête. Renvoie la liste des erreurs (vide si tout est bon).
export function validateSpot(body: Record<string, unknown>): FieldError[] {
  const errors: FieldError[] = [];
  const { name, category_id, images, available, city, latitude, longitude } = body;

  if (typeof name !== 'string' || name.trim() === '') {
    errors.push({ field: 'name', message: 'Le nom est obligatoire' });
  } else if (name.length > 150) {
    errors.push({ field: 'name', message: 'Le nom ne doit pas dépasser 150 caractères' });
  }

  if (typeof category_id !== 'number' || !Number.isInteger(category_id) || category_id <= 0) {
    errors.push({ field: 'category_id', message: 'La catégorie est obligatoire' });
  }

  if (images !== undefined) {
    if (!Array.isArray(images) || images.length > 6) {
      errors.push({ field: 'images', message: 'Les images doivent être une liste de 6 URL maximum' });
    } else {
      images.forEach((url, index) => {
        if (!isHttpUrl(url)) {
          errors.push({ field: `images.${index}`, message: "Cette image n'est pas une URL valide (http ou https)" });
        }
      });
    }
  }

  if (available !== undefined && typeof available !== 'boolean') {
    errors.push({ field: 'available', message: 'La disponibilité doit être true ou false' });
  }

  if (typeof city !== 'string' || city.trim() === '') {
    errors.push({ field: 'city', message: 'La ville est obligatoire' });
  } else if (city.length > 100) {
    errors.push({ field: 'city', message: 'La ville ne doit pas dépasser 100 caractères' });
  }

  if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
    errors.push({ field: 'latitude', message: 'La latitude doit être un nombre entre -90 et 90' });
  }

  if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
    errors.push({ field: 'longitude', message: 'La longitude doit être un nombre entre -180 et 180' });
  }

  return errors;
}

// true si la valeur est une adresse web qui commence par http:// ou https://
function isHttpUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false; // new URL() lance une erreur si le texte n'est pas une URL
  }
}
