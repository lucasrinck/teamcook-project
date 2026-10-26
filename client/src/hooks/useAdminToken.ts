// Garde le token admin en sessionStorage : il disparaît à la fermeture de l'onglet.
// Le token n'est jamais écrit dans le code source : c'est l'administrateur qui le saisit.
// sessionStorage est un petit espace de stockage du navigateur, propre à chaque onglet.
import { useState } from 'react';

// Le nom sous lequel le token est rangé dans sessionStorage
const STORAGE_KEY = 'afterdark-admin-token';

// Lit le token déjà enregistré (ou "" s'il n'y en a pas).
// sessionStorage peut être bloqué (navigation privée, réglages) : on protège chaque accès
// avec try/catch, qui "attrape" l'erreur au lieu de faire planter la page.
function readToken() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function useAdminToken() {
  // Au démarrage, on reprend le token enregistré (s'il existe)
  const [token, setToken] = useState(readToken);

  // Enregistre le token (après un déverrouillage réussi)
  function saveToken(value: string) {
    try {
      sessionStorage.setItem(STORAGE_KEY, value);
    } catch {
      // stockage indisponible : le token reste en mémoire jusqu'au rechargement
    }
    setToken(value);
  }

  // Efface le token (bouton "Se déconnecter", ou token refusé par l'API)
  function clearToken() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // rien à faire
    }
    setToken('');
  }

  return { token, saveToken, clearToken };
}
