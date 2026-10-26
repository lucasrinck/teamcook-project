// Page client "/" : hero, filtres, carte, liste des lieux et fiche détaillée.
// La carte et la liste affichent les MÊMES lieux filtrés (visibleSpots).
import { useState } from 'react';
import { Link } from 'react-router';
import { FiltersBar } from '../components/FiltersBar';
import { Hero } from '../components/Hero';
import { Footer, Navbar } from '../components/Layout';
import { SpotCard } from '../components/SpotCard';
import { SpotDetail } from '../components/SpotDetail';
import { SpotMap } from '../components/SpotMap';
import { Loader, StateMessage } from '../components/StateMessage';
import { useSpots } from '../hooks/useSpots';
import type { SpotFilters } from '../types/spot';
import { EMPTY_FILTERS, filterSpots } from '../utils/spots';

export default function ExplorerPage() {
  // Les données venant de l'API : lieux, catégories, état du chargement, message d'erreur
  const { spots, categories, status, error, retry } = useSpots();
  // Les filtres choisis par l'utilisateur (vides au départ)
  const [filters, setFilters] = useState<SpotFilters>(EMPTY_FILTERS);
  // L'id du lieu dont la fiche est ouverte (null = aucune fiche ouverte)
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Les lieux filtrés : recalculés à chaque affichage (la liste est petite, c'est instantané)
  const visibleSpots = filterSpots(spots, filters);
  // Le lieu sélectionné : find() cherche le lieu qui a cet id (ou null s'il n'y en a pas)
  const selectedSpot = spots.find((spot) => spot.id === selectedId) ?? null;

  return (
    <>
      <Navbar overlay />
      <main>
        <Hero />

        <section
          id="explorer"
          aria-labelledby="explorer-title"
          className="mx-auto flex max-w-7xl scroll-mt-4 flex-col gap-8 px-4 py-16 sm:px-8 sm:py-24"
        >
          {/* Titre de la section + nombre de lieux affichés */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="explorer-title" className="font-display text-6xl leading-none font-black text-mist sm:text-7xl">
              Explorer la nuit
            </h2>
            {/* Si les données sont prêtes : nombre de lieux filtrés sur le nombre total */}
            {status === 'ready' && (
              <p className="text-ash" aria-live="polite">
                {visibleSpots.length} lieux sur {spots.length}
              </p>
            )}
          </div>

          {/* La barre de filtres modifie "filters" grâce à setFilters */}
          <FiltersBar filters={filters} onChange={setFilters} categories={categories} />

          {/* Un seul de ces blocs s'affiche, selon l'état du chargement et des données */}

          {/* 1. Chargement en cours */}
          {status === 'loading' && <Loader />}

          {/* 2. Erreur : l'API n'a pas répondu */}
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

          {/* 3. Aucun lieu dans la base */}
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

          {/* 4. Des lieux existent, mais aucun ne correspond aux filtres */}
          {status === 'ready' && spots.length > 0 && visibleSpots.length === 0 && (
            <StateMessage
              title="Aucun lieu ne correspond"
              action={
                <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="btn btn-primary">
                  Réinitialiser les filtres
                </button>
              }
            >
              Essaie une autre catégorie ou un autre nom.
            </StateMessage>
          )}

          {/* 5. Cas normal : la carte puis la liste des lieux */}
          {status === 'ready' && visibleSpots.length > 0 && (
            <>
              {/* Carte au format paysage, sur toute la largeur */}
              <div className="aspect-[4/3] w-full sm:aspect-video lg:aspect-[2/1]">
                {/* Un clic sur un marqueur appelle setSelectedId : la fiche du lieu s'ouvre */}
                <SpotMap spots={visibleSpots} selectedId={selectedId} onSelect={setSelectedId} />
              </div>

              {/* Liste en cartes avec flex, sous la carte : les cartes passent à la ligne (flex-wrap) */}
              <ul className="flex flex-wrap gap-6">
                {/* map() crée une carte pour chaque lieu filtré. key aide React à les reconnaître. */}
                {visibleSpots.map((spot) => (
                  // Largeur des cartes : 1 par ligne sur mobile, 2 sur tablette, 3 sur ordinateur
                  <li key={spot.id} className="flex w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]">
                    <SpotCard spot={spot} selected={spot.id === selectedId} onExplore={(s) => setSelectedId(s.id)} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </main>
      <Footer />

      {/* La fiche détaillée ne s'affiche que si un lieu est sélectionné. Fermer = plus aucun lieu sélectionné. */}
      {selectedSpot && <SpotDetail spot={selectedSpot} onClose={() => setSelectedId(null)} />}
    </>
  );
}
