// Les routes des lieux : c'est ICI que le serveur appelle Supabase.
// Chaque fonction lit la requête, interroge la base, puis répond avec un code HTTP.
import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

// Colonnes à lire, avec les JOINTURES vers les deux autres tables :
// - category:categories(...)  -> la catégorie liée par category_id
// - infos:spot_infos(...)     -> la localisation liée par spot_id
const SPOT_COLUMNS =
  'id, name, description, images, category:categories(id, name, icon, color), infos:spot_infos(address, city, latitude, longitude)';

// ---------- Petites fonctions utiles ----------

// Lit l'id dans l'URL (/api/spots/12). Renvoie null s'il n'est pas un entier positif.
function readId(req: Request<{ id: string }>): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// true si un champ obligatoire est vide (le serveur ne fait jamais confiance au formulaire).
// latitude et longitude : on teste "== null" car 0 est une valeur valide.
function hasMissingField(body: Record<string, unknown>) {
  const { name, category_id, city, latitude, longitude } = body;
  return !name || !category_id || !city || latitude == null || longitude == null;
}

// Les colonnes de la table spots
function spotRow(body: Record<string, unknown>) {
  return {
    name: body.name,
    category_id: body.category_id,
    description: body.description || null, // champ vide -> null
    images: body.images ?? [],
  };
}

// Les colonnes de la table spot_infos
function infosRow(body: Record<string, unknown>) {
  return {
    address: body.address || null,
    city: body.city,
    latitude: body.latitude,
    longitude: body.longitude,
  };
}

// Relit un lieu complet (avec catégorie et localisation) pour le renvoyer au front
async function findSpot(id: number) {
  const { data } = await supabase.from('spots').select(SPOT_COLUMNS).eq('id', id);
  return data?.[0] ?? null; // Supabase renvoie une liste : on garde le premier (et seul) lieu
}

// ---------- Les routes ----------

// GET /api/spots -> 200 + liste des lieux
export async function getSpots(req: Request, res: Response) {
  const { data, error } = await supabase.from('spots').select(SPOT_COLUMNS).order('id');

  if (error) {
    res.status(500).json({ error: 'Erreur de base de données' });
    return;
  }
  res.status(200).json(data);
}

// POST /api/spots -> 201 + lieu créé, ou 400 si les données sont invalides
export async function createSpot(req: Request, res: Response) {
  const body = req.body ?? {};

  if (hasMissingField(body)) {
    res.status(400).json({ error: 'Nom, catégorie, ville, latitude et longitude sont obligatoires' });
    return;
  }

  // 1. On crée le lieu dans "spots" et on récupère son id
  const { data: created, error } = await supabase.from('spots').insert(spotRow(body)).select('id').single();
  if (error) {
    res.status(500).json({ error: 'Erreur de base de données' });
    return;
  }

  // 2. On crée sa localisation dans "spot_infos", reliée par spot_id
  const { error: infosError } = await supabase.from('spot_infos').insert({ spot_id: created.id, ...infosRow(body) });

  if (infosError) {
    // Pas de transaction possible entre deux requêtes : si la localisation
    // échoue, on supprime le lieu qu'on vient de créer pour ne pas le laisser à moitié.
    await supabase.from('spots').delete().eq('id', created.id);
    res.status(500).json({ error: 'Erreur de base de données' });
    return;
  }

  res.status(201).json(await findSpot(created.id));
}

// PUT /api/spots/:id -> 200 + lieu modifié, 400 si invalide, 404 s'il n'existe pas
export async function updateSpot(req: Request<{ id: string }>, res: Response) {
  const id = readId(req);
  if (id === null) {
    res.status(400).json({ error: 'Identifiant invalide' });
    return;
  }

  const body = req.body ?? {};
  if (hasMissingField(body)) {
    res.status(400).json({ error: 'Nom, catégorie, ville, latitude et longitude sont obligatoires' });
    return;
  }

  // 1. On modifie le lieu. .select('id') renvoie les lignes modifiées :
  //    si la liste est vide, c'est que le lieu n'existe pas.
  const { data, error } = await supabase.from('spots').update(spotRow(body)).eq('id', id).select('id');
  if (error) {
    res.status(500).json({ error: 'Erreur de base de données' });
    return;
  }
  if (data.length === 0) {
    res.status(404).json({ error: 'Lieu introuvable' });
    return;
  }

  // 2. On modifie sa localisation. upsert = "update ou insert" : la fiche est créée si elle manquait.
  const { error: infosError } = await supabase
    .from('spot_infos')
    .upsert({ spot_id: id, ...infosRow(body) }, { onConflict: 'spot_id' });
  if (infosError) {
    res.status(500).json({ error: 'Erreur de base de données' });
    return;
  }

  res.status(200).json(await findSpot(id));
}

// DELETE /api/spots/:id -> 204 sans contenu, 404 s'il n'existe pas.
// La localisation (spot_infos) est supprimée automatiquement par la base (ON DELETE CASCADE).
export async function deleteSpot(req: Request<{ id: string }>, res: Response) {
  const id = readId(req);
  if (id === null) {
    res.status(400).json({ error: 'Identifiant invalide' });
    return;
  }

  const { data, error } = await supabase.from('spots').delete().eq('id', id).select('id');
  if (error) {
    res.status(500).json({ error: 'Erreur de base de données' });
    return;
  }
  if (data.length === 0) {
    res.status(404).json({ error: 'Lieu introuvable' });
    return;
  }

  res.status(204).end();
}
