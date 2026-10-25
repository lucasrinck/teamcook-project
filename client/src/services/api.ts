// Toutes les requêtes HTTP du frontend passent par ce fichier.
// React ne parle JAMAIS directement à Supabase : il appelle l'API Express,
// qui est la seule à connaître la clé secrète.
import type { Category, Spot, SpotInput } from '../types/spot';

// L'adresse de l'API, lue dans le fichier client/.env (ex. http://localhost:3000/api)
const API_URL = import.meta.env.VITE_API_URL;

// Si la variable est oubliée, on prévient dans la console du navigateur
if (!API_URL) {
  console.error('VITE_API_URL est manquant : copie client/.env.example vers client/.env');
}

// Erreur renvoyée par l'API, avec son code HTTP.
// C'est une "classe" : un modèle d'objet. Elle reprend tout ce que fait une Error normale
// (grâce à "extends Error") et ajoute le code HTTP (status), ex. 400, 401, 404...
export class ApiError extends Error {
  status: number;

  // Le constructeur est appelé quand on écrit "new ApiError(404, 'Lieu introuvable')"
  constructor(status: number, message: string) {
    super(message); // on donne le message à la classe Error d'origine
    this.status = status; // et on garde le code HTTP
  }
}

// Fonction commune à toutes les requêtes.
// - path   : la fin de l'adresse, ex. '/spots'
// - method : GET (lire), POST (ajouter), PUT (modifier), DELETE (supprimer)
// - body   : les données à envoyer (facultatif)
// - token  : ajouté dans le header x-admin-token pour les routes d'écriture
// - <T>    : le type de données attendu en réponse
// "async" : la fonction attend la réponse du serveur sans bloquer la page.
async function request<T>(path: string, method = 'GET', body?: unknown, token?: string): Promise<T> {
  // Les headers sont des informations envoyées avec la requête
  const headers: Record<string, string> = {};
  // Si on envoie des données, on précise qu'elles sont au format JSON
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  // Si on a un token admin, on l'ajoute pour que le serveur nous laisse écrire
  if (token) headers['x-admin-token'] = token;

  let response: Response;
  try {
    // fetch() envoie la requête HTTP. JSON.stringify() transforme l'objet en texte JSON.
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // fetch échoue seulement si le serveur est injoignable (éteint, en veille, mauvaise URL)
    throw new ApiError(0, "Impossible de joindre l'API. Vérifie qu'elle est démarrée, puis réessaie.");
  }

  // 204 No Content : pas de corps à lire (DELETE, vérification du token)
  if (response.status === 204) return undefined as T;

  // On lit la réponse JSON. Si elle n'est pas lisible, on prend null au lieu de planter.
  const data = await response.json().catch(() => null);

  // response.ok est faux pour les codes 400, 401, 404, 500... : on lance une ApiError
  // avec le message envoyé par le serveur (ou un message par défaut).
  if (!response.ok) {
    throw new ApiError(response.status, data?.error ?? `Erreur ${response.status}`);
  }
  // Tout va bien : on renvoie les données reçues
  return data as T;
}

// --- Lecture (publique) ---

// GET /api/spots : la liste de tous les lieux
export function getSpots() {
  return request<Spot[]>('/spots');
}

// GET /api/categories : la liste des catégories
export function getCategories() {
  return request<Category[]>('/categories');
}

// --- Administration (token obligatoire) ---

// GET /api/admin/verify : vérifie si le token saisi est le bon (utilisé par l'écran de déverrouillage)
export function verifyAdminToken(token: string) {
  return request<void>('/admin/verify', 'GET', undefined, token);
}

// POST /api/spots : ajoute un lieu
export function createSpot(input: SpotInput, token: string) {
  return request<Spot>('/spots', 'POST', input, token);
}

// PUT /api/spots/:id : modifie le lieu dont on donne l'id
export function updateSpot(id: number, input: SpotInput, token: string) {
  return request<Spot>(`/spots/${id}`, 'PUT', input, token);
}

// DELETE /api/spots/:id : supprime le lieu dont on donne l'id
export function deleteSpot(id: number, token: string) {
  return request<void>(`/spots/${id}`, 'DELETE', undefined, token);
}
