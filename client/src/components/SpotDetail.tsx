// Fiche détaillée d'un lieu : photos, catégorie, description, adresse.
// Panneau fixé à droite sur ordinateur, plein écran sur mobile.
import type { Spot } from '../types/spot';
import { CategoryBadge } from './Badges';
import { SpotImage } from './SpotImage';

type SpotDetailProps = {
  spot: Spot; // le lieu à afficher
  onClose: () => void; // ferme la fiche
};

export function SpotDetail({ spot, onClose }: SpotDetailProps) {
  return (
    <>
      {/* Fond sombre derrière le panneau : un clic dessus ferme la fiche */}
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} aria-hidden="true" />

      {/* Le panneau : plein écran sur mobile, 28rem de large à droite sur ordinateur (lg:) */}
      <aside
        aria-labelledby="spot-detail-title"
        className="fixed inset-0 z-50 flex flex-col gap-5 overflow-y-auto bg-charcoal p-5 lg:inset-y-4 lg:right-4 lg:left-auto lg:w-[28rem] lg:rounded-[2rem] lg:border lg:border-white/10"
      >
        {/* autoFocus : à l'ouverture, le clavier se place sur ce bouton (on peut fermer avec Entrée) */}
        <button type="button" onClick={onClose} className="btn btn-ghost self-start" autoFocus>
          ✕ Fermer
        </button>

        <h2 id="spot-detail-title" className="font-display text-5xl leading-[0.9] font-extrabold text-mist">
          {spot.name}
        </h2>
        <CategoryBadge category={spot.category} />

        {/* Les photos les unes à côté des autres. overflow-x-auto : on peut faire défiler s'il y en a beaucoup. */}
        {spot.images.length > 0 && (
          <div className="flex gap-3 overflow-x-auto">
            {/* map() reçoit aussi la position (index) de chaque photo : 0, 1, 2... */}
            {spot.images.map((url, index) => (
              <SpotImage
                key={url}
                src={url}
                alt={`Photo ${index + 1} : ${spot.name}`}
                className="h-48 w-64 shrink-0 rounded-2xl object-cover"
              />
            ))}
          </div>
        )}

        {/* La description n'est affichée que si elle existe */}
        {spot.description && <p className="leading-relaxed text-mist/80">{spot.description}</p>}

        {/* Adresse du lieu, ou message s'il n'a pas de localisation */}
        <div className="rounded-2xl border border-white/8 bg-forest/50 p-4">
          {/* "condition ? A : B" en JSX : on affiche A si la condition est vraie, sinon B */}
          {spot.infos ? (
            <>
              {spot.infos.address && <p className="text-mist">{spot.infos.address}</p>}
              <p className="text-ash">{spot.infos.city}</p>
            </>
          ) : (
            <p className="text-ash">Localisation non renseignée : ce lieu n'apparaît pas sur la carte.</p>
          )}
        </div>
      </aside>
    </>
  );
}
