// Toutes les requêtes HTTP du frontend passent par ce fichier.
// React ne parle JAMAIS directement à Supabase : il appelle l'API Express,
// qui est la seule à connaître la clé secrète.
import type { Category, FieldError, Spot, SpotInput } from '../types/spot';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error('VITE_API_URL est manquant : copie client/.env.example vers client/.env');
}

// Erreur renvoyée par l'API, avec son code HTTP et le détail par champ
export class ApiError extends Error {
  status: number;
  details: FieldError[];

  constructor(status: number, message: string, details: FieldError[] = []) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Fonction commune à toutes les requêtes.
// - token : ajouté dans le header x-admin-token pour les routes d'écriture
// - <T> : le type de données attendu en réponse
async function request<T>(path: string, method = 'GET', body?: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['x-admin-token'] = token;

  let response: Response;
  try {
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

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, data?.error ?? `Erreur ${response.status}`, data?.details ?? []);
  }
  return data as T;
}

// --- Lecture (publique) ---
export function getSpots() {
  return request<Spot[]>('/spots');
}

export function getCategories() {
  return request<Category[]>('/categories');
}

// --- Administration (token obligatoire) ---
export function verifyAdminToken(token: string) {
  return request<void>('/admin/verify', 'GET', undefined, token);
}

export function createSpot(input: SpotInput, token: string) {
  return request<Spot>('/spots', 'POST', input, token);
}

export function updateSpot(id: number, input: SpotInput, token: string) {
  return request<Spot>(`/spots/${id}`, 'PUT', input, token);
}

export function deleteSpot(id: number, token: string) {
  return request<void>(`/spots/${id}`, 'DELETE', undefined, token);
}
