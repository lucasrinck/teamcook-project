// Page client "/" : hero, filtres, grille des lieux et fiche détaillée.
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { FiltersBar } from '../components/FiltersBar';
import { Hero } from '../components/Hero';
import { Footer, Navbar } from '../components/Layout';
import { SpotCard } from '../components/SpotCard';
import { SpotDetail } from '../components/SpotDetail';
import { Loader, StateMessage } from '../components/StateMessage';
import { useSpots } from '../hooks/useSpots';
import type { SpotFilters } from '../types/spot';
import { EMPTY_FILTERS, filterSpots, getCities } from '../utils/spots';

export default function ExplorerPage() {
  const { spots, categories, status, error, retry } = useSpots();
  const [filters, setFilters] = useState<SpotFilters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Données filtrées : recalculées seulement quand les lieux ou les filtres changent
  const visibleSpots = useMemo(() => filterSpots(spots, filters), [spots, filters]);
  const cities = useMemo(() => getCities(spots), [spots]);
  const selectedSpot = spots.find((spot) => spot.id === selectedId) ?? null;

  return (
    <>
      <Navbar overlay />
      <main>
        <Hero />

        <section id="explorer" aria-labelledby="explorer-title" className="mx-auto flex max-w-7xl scroll-mt-4 flex-col gap-8 px-4 py-16 sm:px-8 sm:py-24">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="explorer-title" className="font-display text-6xl leading-none font-black text-mist sm:text-7xl">
              Explorer la nuit
            </h2>
            {status === 'ready' && (
              <p className="text-ash" aria-live="polite">
                {visibleSpots.length === spots.length
                  ? `${spots.length} lieux à découvrir`
                  : `${visibleSpots.length} lieux sur ${spots.length}`}
              </p>
            )}
          </div>

          <FiltersBar filters={filters} onChange={setFilters} categories={categories} cities={cities} />

          {status === 'loading' && <Loader />}

          {status === 'error' && (
            <StateMessage
              tone="error"
              title="Impossible de charger les lieux"
              action={
                <button type="button" onClick={retry} className="btn btn-primary">
                  Réessayer
                </button>
              }
            >
              {error}
            </StateMessage>
          )}

          {status === 'ready' && spots.length === 0 && (
            <StateMessage
              title="Aucun lieu pour l'instant"
              action={
                <Link to="/admin" className="btn btn-primary">
                  Ouvrir la Control Room
                </Link>
              }
            >
              Ajoute le premier lieu depuis la Control Room.
            </StateMessage>
          )}

          {status === 'ready' && spots.length > 0 && visibleSpots.length === 0 && (
            <StateMessage
              title="Aucun lieu ne correspond"
              action={
                <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="btn btn-primary">
                  Réinitialiser les filtres
                </button>
              }
            >
              Essaie une autre catégorie, une autre ville ou un autre nom.
            </StateMessage>
          )}

          {status === 'ready' && visibleSpots.length > 0 && (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleSpots.map((spot) => (
                <li key={spot.id} className="flex">
                  <SpotCard spot={spot} selected={spot.id === selectedId} onExplore={(s) => setSelectedId(s.id)} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />

      {selectedSpot && <SpotDetail spot={selectedSpot} onClose={() => setSelectedId(null)} />}
    </>
  );
}
