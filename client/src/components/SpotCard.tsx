// Carte d'un lieu dans la grille de la page Explorer.
import type { Spot } from '../types/spot';
import { formatLocation, readDescription } from '../utils/spots';
import { CategoryBadge, DemoTag } from './Badges';
import { Icon } from './Icon';
import { FavoriteButton } from './SpotActions';
import { SpotImage } from './SpotImage';

type SpotCardProps = {
  spot: Spot;
  selected: boolean;
  onExplore: (spot: Spot) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
};

export function SpotCard({ spot, selected, onExplore, isFavorite, onToggleFavorite }: SpotCardProps) {
  const { isDemo, text } = readDescription(spot.description);
  const location = formatLocation(spot);

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-[1.75rem] border bg-forest/50 transition duration-300 hover:-translate-y-1 hover:border-acid/30 hover:shadow-[0_20px_60px_-30px_rgba(212,255,112,0.35)] ${
        selected ? 'border-acid/70' : 'border-white/8'
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <SpotImage
          src={spot.images[0]}
          alt={`Photo : ${spot.name}`}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <FavoriteButton spotName={spot.name} active={isFavorite} onToggle={() => onToggleFavorite(spot.id)} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={spot.category} />
          {isDemo && <DemoTag />}
        </div>
        <h3 className="font-display text-[1.75rem] leading-none font-bold text-mist">{spot.name}</h3>
        {text && <p className="line-clamp-2 text-sm leading-relaxed text-ash">{text}</p>}
        {location && (
          <p className="flex items-start gap-1.5 text-sm text-mist/75">
            <Icon name="map-pin" className="mt-0.5 size-4 shrink-0" />
            {location}
          </p>
        )}

        <div className="mt-auto flex items-center justify-end gap-2 pt-3">
          <button type="button" onClick={() => onExplore(spot)} className="btn btn-secondary">
            Explorer
            <span className="sr-only"> {spot.name}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
