// Fonctions utilitaires sur les lieux (filtrage, description, adresse).
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
