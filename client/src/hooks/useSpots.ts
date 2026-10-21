// Charge les lieux et les catégories depuis l'API.
// Utilisé par la page Explorer et par la page Admin.
import { useCallback, useEffect, useState } from 'react';
import { getCategories, getSpots } from '../services/api';
import type { Category, Spot } from '../types/spot';

type LoadStatus = 'loading' | 'ready' | 'error';

export function useSpots() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState('');

  // Recharge les données depuis l'API (appelé au démarrage et après chaque action CRUD)
  const reload = useCallback(async () => {
    try {
      const [spotsData, categoriesData] = await Promise.all([getSpots(), getCategories()]);
      setSpots(spotsData);
      setCategories(categoriesData);
      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setStatus('error');
    }
  }, []);

  // Après une erreur : on réaffiche le chargement puis on réessaie
  function retry() {
    setStatus('loading');
    reload();
  }

  useEffect(() => {
    reload();
  }, [reload]);

  return { spots, categories, status, error, reload, retry };
}
