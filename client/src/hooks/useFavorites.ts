// Favoris : la liste des id des lieux aimés, gardée dans le navigateur (localStorage).
// Ils ne sont PAS synchronisés : ils restent sur cet appareil et ce navigateur.
// localStorage ressemble à sessionStorage, mais les données restent même après fermeture.
import { useEffect, useState } from 'react';

// Le nom sous lequel la liste est rangée dans localStorage
const STORAGE_KEY = 'afterdark-favorites';

// Lit la liste enregistrée.
// localStorage peut être bloqué ou contenir n'importe quoi : on vérifie tout
function readFavorites(): number[] {
  try {
    // localStorage ne stocke que du texte : JSON.parse retransforme "[1,5]" en liste [1, 5]
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    // On garde seulement les nombres, au cas où le contenu aurait été abîmé
    return Array.isArray(saved) ? saved.filter((id) => typeof id === 'number') : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  // La liste des id favoris, reprise depuis le navigateur au démarrage
  const [favoriteIds, setFavoriteIds] = useState<number[]>(readFavorites);

  // À chaque changement, on enregistre la liste dans le navigateur
  useEffect(() => {
    try {
      // JSON.stringify transforme la liste [1, 5] en texte "[1,5]"
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch {
      // stockage indisponible : les favoris restent valables jusqu'au rechargement
    }
  }, [favoriteIds]);

  // Ajoute le lieu s'il n'est pas en favori, le retire sinon.
  // setFavoriteIds((current) => ...) part toujours de la liste à jour, même si on clique très vite.
  function toggleFavorite(id: number) {
    setFavoriteIds((current) =>
      // includes() : l'id est-il déjà dans la liste ?
      // oui -> filter() crée une liste sans lui ; non -> [...current, id] ajoute l'id à la fin
      current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id],
    );
  }

  return { favoriteIds, toggleFavorite };
}
