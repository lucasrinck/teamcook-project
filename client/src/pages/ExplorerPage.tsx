// Page client "/" : hero, filtres, carte, liste des lieux et fiche détaillée.
// La carte et la liste affichent les MÊMES lieux filtrés (visibleSpots).
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { FiltersBar } from '../components/FiltersBar';
import { Hero } from '../components/Hero';
import { Footer, Navbar } from '../components/Layout';
import { EASE_OUT, Intro, Reveal, shouldPlayIntro } from '../components/Motion';
import { SpotCard } from '../components/SpotCard';
import { SpotDetail } from '../components/SpotDetail';
import { SpotMap } from '../components/SpotMap';
import { Loader, StateMessage } from '../components/StateMessage';
import { useFavorites } from '../hooks/useFavorites';
import { useSpots } from '../hooks/useSpots';
import type { SpotFilters } from '../types/spot';
import { EMPTY_FILTERS, filterSpots, getCities } from '../utils/spots';

export default function ExplorerPage() {
  const { spots, categories, status, error, retry } = useSpots();
  const [filters, setFilters] = useState<SpotFilters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // Intro animée : une fois par session (calculé une seule fois au chargement de la page)
  const [showIntro, setShowIntro] = useState(shouldPlayIntro);
  // Bonus : favoris, gardés dans le navigateur
  const { favoriteIds, toggleFavorite } = useFavorites();

  // Données filtrées : recalculées seulement quand les lieux, les filtres ou les favoris changent
  const visibleSpots = useMemo(() => filterSpots(spots, filters, favoriteIds), [spots, filters, favoriteIds]);
  const cities = useMemo(() => getCities(spots), [spots]);
  const selectedSpot = spots.find((spot) => spot.id === selectedId) ?? null;

  return (
    <>
      <AnimatePresence>{showIntro && <Intro onDone={() => setShowIntro(false)} />}</AnimatePresence>

      <Navbar overlay />
      <main>
        <Hero ready={!showIntro} />

        <section
          id="explorer"
          aria-labelledby="explorer-title"
          className="mx-auto flex max-w-7xl scroll-mt-4 flex-col gap-8 px-4 py-16 sm:px-8 sm:py-24"
        >
          <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
          </Reveal>

          <FiltersBar
            filters={filters}
            onChange={setFilters}
            categories={categories}
            cities={cities}
            favoritesCount={favoriteIds.length}
          />

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
            <>
              {/* Carte au format paysage, sur toute la largeur */}
              <div className="aspect-[4/3] w-full sm:aspect-video lg:aspect-[2/1]">
                <SpotMap spots={visibleSpots} selectedId={selectedId} onSelect={setSelectedId} />
              </div>

              {/* Liste en cartes avec flex, sous la carte : les cartes passent à la ligne (flex-wrap) */}
              <ul className="flex flex-wrap gap-6">
                {/* Quand les filtres changent, les cartes sortent, entrent et se replacent en douceur (layout) */}
                <AnimatePresence mode="popLayout" initial={false}>
                  {visibleSpots.map((spot) => (
                    <motion.li
                      key={spot.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.35, ease: EASE_OUT }}
                      className="flex w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
                    >
                      <SpotCard
                        spot={spot}
                        selected={spot.id === selectedId}
                        onExplore={(s) => setSelectedId(s.id)}
                        isFavorite={favoriteIds.includes(spot.id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </>
          )}
        </section>
      </main>
      <Footer />

      {/* AnimatePresence garde la fiche affichée le temps de son animation de fermeture */}
      <AnimatePresence>
        {selectedSpot && (
          <SpotDetail
            key="detail"
            spot={selectedSpot}
            onClose={() => setSelectedId(null)}
            isFavorite={favoriteIds.includes(selectedSpot.id)}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </AnimatePresence>
    </>
  );
}
