// Page client "/" : hero, filtres, carte, liste des lieux et fiche détaillée.
// La carte et la liste affichent les MÊMES lieux filtrés (visibleSpots).
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { FiltersBar } from '../components/FiltersBar';
import { Hero } from '../components/Hero';
import { Icon } from '../components/Icon';
import { Footer, Navbar } from '../components/Layout';
import { EASE_OUT, Intro, Reveal, shouldPlayIntro } from '../components/Motion';
import { SpotCard } from '../components/SpotCard';
import { SpotDetail } from '../components/SpotDetail';
import { SpotMap } from '../components/SpotMap';
import { Loader, StateMessage } from '../components/StateMessage';
import { useSpots } from '../hooks/useSpots';
import type { SpotFilters } from '../types/spot';
import { EMPTY_FILTERS, filterSpots, getCities } from '../utils/spots';

export default function ExplorerPage() {
  const { spots, categories, status, error, retry } = useSpots();
  const [filters, setFilters] = useState<SpotFilters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // Sur mobile, on affiche soit la liste, soit la carte (sur ordinateur : les deux)
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  // Intro animée : une fois par session (calculé une seule fois au chargement de la page)
  const [showIntro, setShowIntro] = useState(shouldPlayIntro);

  // Données filtrées : recalculées seulement quand les lieux ou les filtres changent
  const visibleSpots = useMemo(() => filterSpots(spots, filters), [spots, filters]);
  const cities = useMemo(() => getCities(spots), [spots]);
  const selectedSpot = spots.find((spot) => spot.id === selectedId) ?? null;
  const mappedCount = visibleSpots.filter((spot) => spot.infos !== null).length;

  return (
    <>
      <AnimatePresence>{showIntro && <Intro onDone={() => setShowIntro(false)} />}</AnimatePresence>

      <Navbar overlay />
      <main>
        <Hero ready={!showIntro} onExploreMap={() => setMobileView('map')} />

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
            <>
              {/* Choix Liste / Carte, seulement sur mobile et tablette */}
              <div
                role="group"
                aria-label="Affichage"
                className="grid grid-cols-2 gap-1 rounded-full border border-white/10 p-1 lg:hidden"
              >
                <button
                  type="button"
                  aria-pressed={mobileView === 'list'}
                  onClick={() => setMobileView('list')}
                  className="view-toggle"
                >
                  Liste
                </button>
                <button
                  type="button"
                  aria-pressed={mobileView === 'map'}
                  onClick={() => setMobileView('map')}
                  className="view-toggle"
                >
                  <Icon name="map-pin" className="size-4" />
                  Carte ({mappedCount})
                </button>
              </div>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                {/* Carte : à gauche et fixe pendant le défilement sur ordinateur */}
                <div
                  className={`${mobileView === 'map' ? 'block' : 'hidden'} h-[70svh] lg:sticky lg:top-4 lg:block lg:h-[calc(100svh-2rem)] lg:w-[54%] lg:shrink-0`}
                >
                  <SpotMap spots={visibleSpots} selectedId={selectedId} onSelect={setSelectedId} />
                </div>

                {/* Liste en cartes avec flex : les cartes passent à la ligne (flex-wrap) */}
                <ul className={`${mobileView === 'list' ? 'flex' : 'hidden'} flex-1 flex-wrap gap-6 lg:flex`}>
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
                        className="flex w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-full xl:w-[calc((100%-1.5rem)/2)]"
                      >
                        <SpotCard
                          spot={spot}
                          selected={spot.id === selectedId}
                          onExplore={(s) => setSelectedId(s.id)}
                        />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />

      {/* AnimatePresence garde la fiche affichée le temps de son animation de fermeture */}
      <AnimatePresence>
        {selectedSpot && <SpotDetail key="detail" spot={selectedSpot} onClose={() => setSelectedId(null)} />}
      </AnimatePresence>
    </>
  );
}
