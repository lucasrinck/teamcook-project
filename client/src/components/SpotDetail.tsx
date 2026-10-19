// Fiche détaillée d'un lieu : galerie, catégorie, description, adresse.
// Panneau latéral sur ordinateur, panneau inférieur sur mobile.
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Spot } from '../types/spot';
import { readDescription } from '../utils/spots';
import { AvailabilityBadge, CategoryBadge, DemoTag } from './Badges';
import { Icon } from './Icon';
import { EASE_OUT } from './Motion';
import { SpotImage } from './SpotImage';

type SpotDetailProps = {
  spot: Spot;
  onClose: () => void;
};

export function SpotDetail({ spot, onClose }: SpotDetailProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { isDemo, text } = readDescription(spot.description);
  const imageCount = spot.images.length;

  // Nouveau lieu sélectionné : on revient à la première photo et on place le
  // focus sur le titre (utile au clavier et aux lecteurs d'écran)
  useEffect(() => {
    setImageIndex(0);
    titleRef.current?.focus();
  }, [spot.id]);

  // Touche Échap : fermer la fiche
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Sur ordinateur le panneau glisse depuis la droite, sur mobile depuis le bas
  const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
  const hiddenPosition = isDesktop ? { x: 48, opacity: 0 } : { y: '100%' };

  function showImage(step: number) {
    setImageIndex((imageIndex + step + imageCount) % imageCount);
  }

  return (
    <motion.aside
      aria-labelledby="spot-detail-title"
      initial={hiddenPosition}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={hiddenPosition}
      transition={{ duration: 0.45, ease: EASE_OUT }}
      className="fixed inset-x-0 bottom-0 z-40 max-h-[85svh] overflow-y-auto rounded-t-[2rem] border-t border-white/10 bg-charcoal shadow-[0_-30px_80px_-20px_rgba(0,0,0,0.8)] lg:inset-x-auto lg:top-4 lg:right-4 lg:bottom-4 lg:max-h-none lg:w-[28rem] lg:rounded-[2rem] lg:border"
    >
      {/* Poignée visuelle du panneau mobile */}
      <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-white/20 lg:hidden" aria-hidden="true" />

      <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-4 lg:pt-5">
        <button type="button" onClick={onClose} className="btn btn-ghost">
          <Icon name="chevron-left" />
          Retour à la liste
        </button>
        <AvailabilityBadge available={spot.available} />
      </div>

      {/* Galerie */}
      <div className="relative mx-5 overflow-hidden rounded-3xl">
        <SpotImage
          src={spot.images[imageIndex]}
          alt={`Photo ${imageIndex + 1} sur ${Math.max(imageCount, 1)} : ${spot.name}`}
          className={`aspect-[4/3] w-full object-cover ${spot.available ? '' : 'grayscale'}`}
        />
        {imageCount > 1 && (
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
            <button type="button" onClick={() => showImage(-1)} className="gallery-btn" aria-label="Photo précédente">
              <Icon name="chevron-left" />
            </button>
            <span className="rounded-full bg-charcoal/80 px-3 py-1 text-xs text-mist" aria-hidden="true">
              {imageIndex + 1} / {imageCount}
            </span>
            <button type="button" onClick={() => showImage(1)} className="gallery-btn" aria-label="Photo suivante">
              <Icon name="chevron-right" />
            </button>
          </div>
        )}
      </div>

      {imageCount > 1 && (
        <div className="mx-5 mt-3 flex gap-2">
          {spot.images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setImageIndex(index)}
              aria-label={`Afficher la photo ${index + 1}`}
              aria-current={index === imageIndex}
              className={`size-14 overflow-hidden rounded-xl border-2 transition ${
                index === imageIndex ? 'border-acid' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <SpotImage src={image} alt="" className="h-full w-full object-cover" compact />
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 px-5 pt-6 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <CategoryBadge category={spot.category} />
          {isDemo && <DemoTag />}
        </div>

        <h2
          id="spot-detail-title"
          ref={titleRef}
          tabIndex={-1}
          className="font-display text-5xl leading-[0.9] font-extrabold text-mist outline-none"
        >
          {spot.name}
        </h2>

        {text && <p className="leading-relaxed text-mist/80">{text}</p>}

        <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-forest/50 p-4">
          <Icon name="map-pin" className="mt-0.5 size-5 shrink-0 text-acid" />
          {spot.infos ? (
            <div>
              {spot.infos.address && <p className="text-mist">{spot.infos.address}</p>}
              <p className="text-ash">{spot.infos.city}</p>
            </div>
          ) : (
            <p className="text-ash">Localisation non renseignée : ce lieu n'apparaît pas sur la carte.</p>
          )}
        </div>

        {isDemo && (
          <p className="text-sm text-ash">
            Ce lieu est inventé pour la démonstration : son adresse est approximative et sa disponibilité n'est pas
            réelle.
          </p>
        )}
      </div>
    </motion.aside>
  );
}
