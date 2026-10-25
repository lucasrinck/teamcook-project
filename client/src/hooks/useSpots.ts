// Charge les lieux et les catégories depuis l'API.
// Utilisé par la page Explorer et par la page Admin.
// Un "hook" est une fonction React qui commence par "use" et qui peut garder des données (état).
import { useCallback, useEffect, useState } from 'react';
import { getCategories, getSpots } from '../services/api';
import type { Category, Spot } from '../types/spot';

// Les 3 états possibles du chargement : en cours, prêt, ou en erreur
type LoadStatus = 'loading' | 'ready' | 'error';

export function useSpots() {
  // useState crée une donnée qui, quand elle change, met à jour l'affichage.
  // Il renvoie la valeur et la fonction pour la modifier (le "setter").
  const [spots, setSpots] = useState<Spot[]>([]); // les lieux, vide au départ
  const [categories, setCategories] = useState<Category[]>([]); // les catégories
  const [status, setStatus] = useState<LoadStatus>('loading'); // on commence en "chargement"
  const [error, setError] = useState(''); // le message d'erreur éventuel

  // Recharge les données depuis l'API (appelé au démarrage et après chaque action CRUD).
  // useCallback garde la même fonction d'un affichage à l'autre (utile pour useEffect plus bas).
  const reload = useCallback(async () => {
    try {
      // Promise.all lance les deux requêtes en même temps et attend les deux réponses
      const [spotsData, categoriesData] = await Promise.all([getSpots(), getCategories()]);
      setSpots(spotsData);
      setCategories(categoriesData);
      setStatus('ready');
    } catch (err) {
      // Si une requête échoue, on garde le message pour l'afficher
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setStatus('error');
    }
  }, []);

  // Après une erreur : on réaffiche le chargement puis on réessaie
  function retry() {
    setStatus('loading');
    reload();
  }

  // useEffect lance du code après l'affichage du composant.
  // Ici : on charge les données une fois, quand la page apparaît.
  useEffect(() => {
    reload();
  }, [reload]);

  // On renvoie tout ce dont les pages ont besoin
  return { spots, categories, status, error, reload, retry };
}
