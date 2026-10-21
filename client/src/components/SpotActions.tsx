// Bouton favori, réutilisé dans les cartes et dans la fiche détaillée.
import { Icon } from './Icon';

type FavoriteButtonProps = {
  spotName: string;
  active: boolean;
  onToggle: () => void;
  withLabel?: boolean; // true : bouton avec texte (fiche détaillée), false : icône seule (cartes)
};

// Cœur : ajouter / retirer des favoris (aria-pressed indique l'état aux lecteurs d'écran)
export function FavoriteButton({ spotName, active, onToggle, withLabel = false }: FavoriteButtonProps) {
  const label = active ? `Retirer ${spotName} des favoris` : `Ajouter ${spotName} aux favoris`;
  const icon = <Icon name="heart" className={`size-5 ${active ? 'fill-current text-acid' : ''}`} />;

  if (withLabel) {
    return (
      <button type="button" onClick={onToggle} aria-pressed={active} className="btn btn-ghost self-start">
        {icon}
        {active ? 'Dans tes favoris' : 'Ajouter aux favoris'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className="grid size-11 shrink-0 place-items-center rounded-full bg-charcoal/85 text-mist backdrop-blur transition hover:text-acid"
    >
      {icon}
    </button>
  );
}
