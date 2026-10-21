// Garde le token admin en sessionStorage : il disparaît à la fermeture de l'onglet.
// Le token n'est jamais écrit dans le code source : c'est l'administrateur qui le saisit.
import { useState } from 'react';

const STORAGE_KEY = 'afterdark-admin-token';

// sessionStorage peut être bloqué (navigation privée, réglages) : on protège chaque accès
function readToken() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function useAdminToken() {
  const [token, setToken] = useState(readToken);

  function saveToken(value: string) {
    try {
      sessionStorage.setItem(STORAGE_KEY, value);
    } catch {
      // stockage indisponible : le token reste en mémoire jusqu'au rechargement
    }
    setToken(value);
  }

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
