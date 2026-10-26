// Carte d'un lieu dans la grille de la page Explorer.
import type { Spot } from '../types/spot';
import { formatLocation } from '../utils/spots';
import { CategoryBadge } from './Badges';
import { SpotImage } from './SpotImage';

type SpotCardProps = {
  spot: Spot; // le lieu à afficher
  selected: boolean; // true si c'est le lieu actuellement ouvert (bordure verte)
  onExplore: (spot: Spot) => void; // appelé au clic sur "Explorer" (ouvre la fiche)
};

export function SpotCard({ spot, selected, onExplore }: SpotCardProps) {
  // L'adresse à afficher (ou la ville si l'adresse est vide)
  const location = formatLocation(spot);

  return (
    <article
      // Les classes "hover:" ne s'appliquent qu'au survol de la souris (la carte remonte un peu)
      className={`group flex flex-col overflow-hidden rounded-[1.75rem] border bg-forest/50 transition duration-300 hover:-translate-y-1 hover:border-acid/30 hover:shadow-[0_20px_60px_-30px_rgba(212,255,112,0.35)] ${
        selected ? 'border-acid/70' : 'border-white/8'
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* La première image du lieu sert de couverture. "group-hover:" zoome la photo au survol de la carte. */}
        <SpotImage
          src={spot.images[0]}
          alt={`Photo : ${spot.name}`}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <CategoryBadge category={spot.category} />
        <h3 className="font-display text-[1.75rem] leading-none font-bold text-mist">{spot.name}</h3>
        {/* line-clamp-2 : la description est coupée après 2 lignes */}
        {spot.description && <p className="line-clamp-2 text-sm leading-relaxed text-ash">{spot.description}</p>}
        {location && <p className="text-sm text-mist/75">{location}</p>}

        {/* mt-auto pousse le bouton tout en bas de la carte, même si le texte est court */}
        <div className="mt-auto flex items-center justify-end gap-2 pt-3">
          <button type="button" onClick={() => onExplore(spot)} className="btn btn-secondary">
            Explorer
            {/* Texte lu seulement par les lecteurs d'écran : "Explorer Le Jardin des Lanternes" */}
            <span className="sr-only"> {spot.name}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
