// Fonctions utilitaires sur les lieux (filtrage, villes, description).
import type { Spot, SpotFilters } from '../types/spot';

export const EMPTY_FILTERS: SpotFilters = {
  search: '',
  categoryId: null,
  city: '',
  onlyAvailable: false,
};

// Met en minuscules et retire les accents : "Café" et "cafe" se trouvent pareil
export function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

// FILTRAGE CÔTÉ CLIENT : on garde seulement les lieux qui respectent tous les filtres.
// La liste et la carte utilisent le même résultat.
export function filterSpots(spots: Spot[], filters: SpotFilters): Spot[] {
  const search = normalizeText(filters.search.trim());

  return spots.filter((spot) => {
    if (search && !normalizeText(spot.name).includes(search)) return false;
    if (filters.categoryId !== null && spot.category.id !== filters.categoryId) return false;
    if (filters.city && spot.infos?.city !== filters.city) return false;
    if (filters.onlyAvailable && !spot.available) return false;
    return true;
  });
}

// Nombre de filtres actifs (affiché sur le bouton "Filtres" en mobile)
export function countActiveFilters(filters: SpotFilters) {
  let count = 0;
  if (filters.search.trim()) count++;
  if (filters.categoryId !== null) count++;
  if (filters.city) count++;
  if (filters.onlyAvailable) count++;
  return count;
}

// Liste des villes distinctes, triée (valeurs de infos.city)
export function getCities(spots: Spot[]): string[] {
  const cities: string[] = [];
  for (const spot of spots) {
    if (spot.infos && !cities.includes(spot.infos.city)) cities.push(spot.infos.city);
  }
  return cities.sort((a, b) => a.localeCompare(b, 'fr'));
}

// Les descriptions de démonstration commencent par "[Démo — lieu fictif]".
// On retire ce préfixe du texte et on l'affiche à la place sous forme d'étiquette.
const DEMO_PREFIX = /^\[Démo[^\]]*\]\s*/i;

export function readDescription(description: string | null) {
  const text = description ?? '';
  return {
    isDemo: DEMO_PREFIX.test(text),
    text: text.replace(DEMO_PREFIX, ''),
  };
}

// Adresse affichable : l'adresse si elle existe, sinon la ville
export function formatLocation(spot: Spot) {
  if (!spot.infos) return '';
  return spot.infos.address || spot.infos.city;
}
