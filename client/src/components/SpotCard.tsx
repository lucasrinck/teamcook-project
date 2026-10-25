// Carte d'un lieu dans la grille de la page Explorer.
import type { Spot } from '../types/spot';
import { formatLocation, readDescription } from '../utils/spots';
import { CategoryBadge, DemoTag } from './Badges';
import { Icon } from './Icon';
import { FavoriteButton } from './SpotActions';
import { SpotImage } from './SpotImage';

type SpotCardProps = {
  spot: Spot; // le lieu à afficher
  selected: boolean; // true si c'est le lieu actuellement ouvert (bordure verte)
  onExplore: (spot: Spot) => void; // appelé au clic sur "Explorer" (ouvre la fiche)
  isFavorite: boolean; // true si le lieu est dans les favoris
  onToggleFavorite: (id: number) => void; // appelé au clic sur le cœur
};

export function SpotCard({ spot, selected, onExplore, isFavorite, onToggleFavorite }: SpotCardProps) {
  // On sépare la description en deux : est-ce un lieu de démo ? + le texte à afficher
  const { isDemo, text } = readDescription(spot.description);
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
        {/* Le cœur, posé en haut à droite de la photo */}
        <div className="absolute top-2 right-2">
          <FavoriteButton spotName={spot.name} active={isFavorite} onToggle={() => onToggleFavorite(spot.id)} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={spot.category} />
          {/* L'étiquette "Lieu fictif" n'apparaît que pour les lieux de démonstration */}
          {isDemo && <DemoTag />}
        </div>
        <h3 className="font-display text-[1.75rem] leading-none font-bold text-mist">{spot.name}</h3>
        {/* line-clamp-2 : la description est coupée après 2 lignes */}
        {text && <p className="line-clamp-2 text-sm leading-relaxed text-ash">{text}</p>}
        {location && (
          <p className="flex items-start gap-1.5 text-sm text-mist/75">
            <Icon name="map-pin" className="mt-0.5 size-4 shrink-0" />
            {location}
          </p>
        )}

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
