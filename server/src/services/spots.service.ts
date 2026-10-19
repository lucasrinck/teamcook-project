// Toutes les requêtes vers Supabase concernant les lieux.
// C'est ICI (et seulement ici) que le serveur appelle la base pour les lieux.
// On utilise uniquement les méthodes du client Supabase (.select, .insert...) :
// jamais de SQL construit avec des chaînes venant de l'utilisateur.
import { supabase } from '../config/supabase.js';
import type { Spot } from '../types/spot.js';
import type { SpotInput } from '../validators/spot.validator.js';
import { HttpError } from '../middleware/httpError.js';
import { toHttpError } from './supabaseError.js';

// Colonnes à lire, avec les JOINTURES vers les deux autres tables :
// - category:categories(...)  -> la catégorie liée par category_id
// - infos:spot_infos(...)     -> la fiche de localisation liée par spot_id
// "category:" et "infos:" renomment les clés dans la réponse.
// spot_id étant UNIQUE, Supabase renvoie infos sous forme d'objet (ou null).
const SPOT_COLUMNS =
  'id, name, description, images, available, category:categories(id, name, icon, color), infos:spot_infos(address, city, latitude, longitude)';

// Sans le schéma de la base, TypeScript ne peut pas deviner le type exact du
// résultat (il croit que les jointures renvoient des tableaux). overrideTypes
// lui indique la forme réelle, celle de notre type Spot.

// Sépare les données validées entre les deux tables.
function spotColumns(input: SpotInput) {
  return {
    name: input.name,
    category_id: input.category_id,
    description: input.description || null, // "" devient null
    images: input.images,
    available: input.available,
  };
}

function infosColumns(input: SpotInput) {
  return {
    address: input.address || null,
    city: input.city,
    latitude: input.latitude,
    longitude: input.longitude,
  };
}

// READ : tous les lieux
export async function listSpots(): Promise<Spot[]> {
  const { data, error } = await supabase
    .from('spots')
    .select(SPOT_COLUMNS)
    .order('id')
    .overrideTypes<Spot[], { merge: false }>();

  if (error) throw toHttpError(error);
  return data;
}

// READ : un lieu (null s'il n'existe pas)
export async function findSpotById(id: number): Promise<Spot | null> {
  const { data, error } = await supabase
    .from('spots')
    .select(SPOT_COLUMNS)
    .eq('id', id)
    .maybeSingle()
    .overrideTypes<Spot, { merge: false }>();

  if (error) throw toHttpError(error);
  return data;
}

// Relit un lieu qu'on vient d'écrire, pour le renvoyer au format complet.
async function getWrittenSpot(id: number): Promise<Spot> {
  const spot = await findSpotById(id);
  if (!spot) throw new HttpError(500, 'Le lieu enregistré est introuvable');
  return spot;
}

// CREATE : un lieu + sa fiche spot_infos
export async function createSpot(input: SpotInput): Promise<Spot> {
  // 1. On crée le lieu dans "spots" et on récupère son id
  const { data: created, error } = await supabase
    .from('spots')
    .insert(spotColumns(input))
    .select('id')
    .single();

  if (error) throw toHttpError(error);

  // 2. On crée sa fiche dans "spot_infos", reliée par spot_id
  const { error: infosError } = await supabase
    .from('spot_infos')
    .insert({ spot_id: created.id, ...infosColumns(input) });

  if (infosError) {
    // ANNULATION MANUELLE : supabase-js ne permet pas de transaction entre
    // deux requêtes. Si la fiche échoue, on supprime le lieu qu'on vient de
    // créer, sinon il resterait un lieu sans localisation dans la base.
    await supabase.from('spots').delete().eq('id', created.id);
    throw toHttpError(infosError);
  }

  return getWrittenSpot(created.id);
}

// UPDATE (remplacement complet) : le lieu + sa fiche. Renvoie null si le lieu n'existe pas.
export async function replaceSpot(id: number, input: SpotInput): Promise<Spot | null> {
  // 0. On lit l'ancienne version : elle permet de répondre 404 si le lieu
  //    n'existe pas, et de revenir en arrière si l'étape 2 échoue.
  const { data: previous, error: readError } = await supabase
    .from('spots')
    .select('name, category_id, description, images, available')
    .eq('id', id)
    .maybeSingle();

  if (readError) throw toHttpError(readError);
  if (!previous) return null;

  // 1. On met à jour le lieu dans "spots"
  const { error } = await supabase.from('spots').update(spotColumns(input)).eq('id', id);
  if (error) throw toHttpError(error);

  // 2. On met à jour sa fiche. upsert = "update ou insert" : si la fiche
  //    n'existait pas (lieu ajouté hors de l'application), elle est créée.
  const { error: infosError } = await supabase
    .from('spot_infos')
    .upsert({ spot_id: id, ...infosColumns(input) }, { onConflict: 'spot_id' });

  if (infosError) {
    // ANNULATION MANUELLE : on remet l'ancienne version du lieu.
    await supabase.from('spots').update(previous).eq('id', id);
    throw toHttpError(infosError);
  }

  return getWrittenSpot(id);
}

// DELETE : supprime le lieu. Renvoie false s'il n'existait pas.
// La fiche spot_infos est supprimée automatiquement par la base
// grâce à ON DELETE CASCADE sur spot_infos.spot_id.
export async function deleteSpot(id: number): Promise<boolean> {
  const { data, error } = await supabase.from('spots').delete().eq('id', id).select('id');

  if (error) throw toHttpError(error);
  return data.length > 0;
}
