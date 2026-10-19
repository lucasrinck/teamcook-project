// Carte d'un lieu dans la grille de la page Explorer.
import type { Spot } from '../types/spot';
import { formatLocation, readDescription } from '../utils/spots';
import { AvailabilityBadge, CategoryBadge, DemoTag } from './Badges';
import { Icon } from './Icon';
import { SpotImage } from './SpotImage';

type SpotCardProps = {
  spot: Spot;
  selected: boolean;
  onExplore: (spot: Spot) => void;
};

export function SpotCard({ spot, selected, onExplore }: SpotCardProps) {
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
          className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${
            spot.available ? '' : 'grayscale'
          }`}
        />
        <div className="absolute top-3 left-3">
          <AvailabilityBadge available={spot.available} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <CategoryBadge category={spot.category} />
        <h3 className={`font-display text-[1.75rem] leading-none font-bold ${spot.available ? 'text-mist' : 'text-mist/60'}`}>
          {spot.name}
        </h3>
        {text && <p className="line-clamp-2 text-sm leading-relaxed text-ash">{text}</p>}
        {location && (
          <p className="flex items-start gap-1.5 text-sm text-mist/75">
            <Icon name="map-pin" className="mt-0.5 size-4 shrink-0" />
            {location}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          {isDemo ? <DemoTag /> : <span />}
          <button type="button" onClick={() => onExplore(spot)} className="btn btn-secondary">
            Explorer
            <span className="sr-only"> {spot.name}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
