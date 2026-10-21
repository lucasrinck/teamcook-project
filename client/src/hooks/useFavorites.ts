// Favoris : la liste des id des lieux aimés, gardée dans le navigateur (localStorage).
// Ils ne sont PAS synchronisés : ils restent sur cet appareil et ce navigateur.
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'afterdark-favorites';

// localStorage peut être bloqué ou contenir n'importe quoi : on vérifie tout
function readFavorites(): number[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(saved) ? saved.filter((id) => typeof id === 'number') : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>(readFavorites);

  // À chaque changement, on enregistre la liste dans le navigateur
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch {
      // stockage indisponible : les favoris restent valables jusqu'au rechargement
    }
  }, [favoriteIds]);

  // Ajoute le lieu s'il n'est pas en favori, le retire sinon.
  // setFavoriteIds((current) => ...) part toujours de la liste à jour, même si on clique très vite.
  function toggleFavorite(id: number) {
    setFavoriteIds((current) =>
      current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id],
    );
  }

  return { favoriteIds, toggleFavorite };
}
