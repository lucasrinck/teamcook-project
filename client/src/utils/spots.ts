// Fonctions utilitaires sur les lieux (filtrage, adresse).
// Ce sont de simples fonctions : elles reçoivent des données et renvoient un résultat.
import type { Spot, SpotFilters } from '../types/spot';

// Les filtres "vides" : rien n'est filtré (utilisé au départ et pour "Réinitialiser")
export const EMPTY_FILTERS: SpotFilters = {
  search: '',
  categoryId: null,
};

// FILTRAGE CÔTÉ CLIENT : on garde seulement les lieux qui respectent les deux filtres.
// La liste et la carte utilisent le même résultat.
export function filterSpots(spots: Spot[], filters: SpotFilters): Spot[] {
  // Le texte recherché, sans espaces autour et en minuscules ("  SOUS " devient "sous")
  const search = filters.search.trim().toLowerCase();

  // filter() garde les lieux pour lesquels la fonction renvoie true
  return spots.filter((spot) => {
    // Recherche : le nom (en minuscules) doit contenir le texte tapé
    const nameMatches = spot.name.toLowerCase().includes(search);
    // Catégorie : aucune catégorie choisie (null), ou la même que celle du lieu
    const categoryMatches = filters.categoryId === null || spot.category.id === filters.categoryId;
    return nameMatches && categoryMatches;
  });
}

// Adresse affichable : l'adresse si elle existe, sinon la ville
export function formatLocation(spot: Spot) {
  if (!spot.infos) return ''; // pas de localisation : rien à afficher
  return spot.infos.address || spot.infos.city;
}
