// Fonctions utilitaires sur les lieux (filtrage, villes, description).
// Ce sont de simples fonctions : elles reçoivent des données et renvoient un résultat.
import type { Spot, SpotFilters } from '../types/spot';

// Les filtres "vides" : rien n'est filtré (utilisé au départ et pour "Réinitialiser les filtres")
export const EMPTY_FILTERS: SpotFilters = {
  search: '',
  categoryId: null,
  city: '',
  onlyFavorites: false,
};

// Met en minuscules et retire les accents : "Café" et "cafe" se trouvent pareil
export function normalizeText(text: string) {
  return (
    text
      // "Café" devient "café"
      .toLowerCase()
      // normalize('NFD') sépare chaque lettre de son accent : "é" devient "e" + "´"
      .normalize('NFD')
      // on supprime ensuite tous les accents séparés (caractères Unicode de U+0300 à U+036F)
      .replace(/[\u0300-\u036f]/g, '')
  );
}

// FILTRAGE CÔTÉ CLIENT : on garde seulement les lieux qui respectent tous les filtres.
// La liste et la carte utilisent le même résultat.
// favoriteIds : les lieux mis en favoris (pour le filtre "Mes favoris")
export function filterSpots(spots: Spot[], filters: SpotFilters, favoriteIds: number[]): Spot[] {
  // Le texte recherché, sans espaces autour, en minuscules et sans accents
  const search = normalizeText(filters.search.trim());

  // filter() garde les lieux pour lesquels la fonction renvoie true.
  // Dès qu'un filtre n'est pas respecté, on renvoie false : le lieu est écarté.
  return spots.filter((spot) => {
    // Recherche : le nom doit contenir le texte tapé
    if (search && !normalizeText(spot.name).includes(search)) return false;
    // Catégorie : si une catégorie est choisie, le lieu doit être de cette catégorie
    if (filters.categoryId !== null && spot.category.id !== filters.categoryId) return false;
    // Ville : si une ville est choisie, le lieu doit être dans cette ville
    if (filters.city && spot.infos?.city !== filters.city) return false;
    // Favoris : si le filtre est activé, le lieu doit être dans la liste des favoris
    if (filters.onlyFavorites && !favoriteIds.includes(spot.id)) return false;
    // Tous les filtres sont respectés : on garde le lieu
    return true;
  });
}

// Nombre de filtres actifs (affiché sur le bouton "Filtres" en mobile)
export function countActiveFilters(filters: SpotFilters) {
  let count = 0;
  // count++ ajoute 1 au compteur
  if (filters.search.trim()) count++;
  if (filters.categoryId !== null) count++;
  if (filters.city) count++;
  if (filters.onlyFavorites) count++;
  return count;
}

// Liste des villes distinctes, triée (valeurs de infos.city)
export function getCities(spots: Spot[]): string[] {
  const cities: string[] = [];
  // On parcourt tous les lieux et on ajoute chaque ville une seule fois
  for (const spot of spots) {
    if (spot.infos && !cities.includes(spot.infos.city)) cities.push(spot.infos.city);
  }
  // Tri alphabétique, en suivant les règles du français (accents compris)
  return cities.sort((a, b) => a.localeCompare(b, 'fr'));
}

// Les descriptions de démonstration commencent par "[Démo — lieu fictif]".
// On retire ce préfixe du texte et on l'affiche à la place sous forme d'étiquette.
// C'est une "expression régulière" : un motif de texte. Celle-ci reconnaît "[Démo ...]" en début de texte.
const DEMO_PREFIX = /^\[Démo[^\]]*\]\s*/i;

// Sépare une description en deux informations :
// - isDemo : true si elle commence par "[Démo ...]"
// - text   : la description sans ce préfixe
export function readDescription(description: string | null) {
  const text = description ?? ''; // si la description est vide (null), on prend ""
  return {
    isDemo: DEMO_PREFIX.test(text), // test() renvoie true si le motif est trouvé
    text: text.replace(DEMO_PREFIX, ''), // replace() enlève le préfixe
  };
}

// Adresse affichable : l'adresse si elle existe, sinon la ville
export function formatLocation(spot: Spot) {
  if (!spot.infos) return ''; // pas de localisation : rien à afficher
  return spot.infos.address || spot.infos.city;
}
