// Boutons d'action sur un lieu, réutilisés dans les cartes et dans la fiche détaillée.
import { Icon } from './Icon';

type FavoriteButtonProps = {
  spotName: string;
  active: boolean;
  onToggle: () => void;
};

// Cœur : ajouter / retirer des favoris (aria-pressed indique l'état aux lecteurs d'écran)
export function FavoriteButton({ spotName, active, onToggle }: FavoriteButtonProps) {
  const label = active ? `Retirer ${spotName} des favoris` : `Ajouter ${spotName} aux favoris`;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`grid size-11 shrink-0 place-items-center rounded-full bg-charcoal/85 backdrop-blur transition ${
        active ? 'text-acid' : 'text-mist hover:text-acid'
      }`}
    >
      <Icon name="heart" className={`size-5 ${active ? 'fill-current' : ''}`} />
    </button>
  );
}

type RouteButtonProps = {
  spotName: string;
  step: number | null; // numéro d'étape dans la Night Route, null si le lieu n'y est pas
  canBeAdded: boolean; // false si le lieu n'a pas de localisation (impossible de le relier)
  onToggle: () => void;
};

// Ajouter / retirer un lieu de la Night Route
export function RouteButton({ spotName, step, canBeAdded, onToggle }: RouteButtonProps) {
  const inRoute = step !== null;
  const label = inRoute
    ? `Retirer ${spotName} de la Night Route (étape ${step})`
    : `Ajouter ${spotName} à la Night Route`;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!inRoute && !canBeAdded}
      aria-pressed={inRoute}
      aria-label={label}
      title={canBeAdded || inRoute ? label : "Ce lieu n'a pas de localisation"}
      className={`btn px-4 ${inRoute ? 'border border-volt/60 bg-volt/15 text-mist' : 'btn-ghost'}`}
    >
      <Icon name="route" className="size-4" />
      {inRoute ? `Étape ${step}` : 'Route'}
    </button>
  );
}
