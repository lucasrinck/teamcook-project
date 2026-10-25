// Bouton favori, réutilisé dans les cartes et dans la fiche détaillée.
import { Icon } from './Icon';

type FavoriteButtonProps = {
  spotName: string; // nom du lieu (pour le texte lu par les lecteurs d'écran)
  active: boolean; // true si le lieu est déjà en favori
  onToggle: () => void; // fonction appelée au clic (ajoute ou retire le favori)
  withLabel?: boolean; // true : bouton avec texte (fiche détaillée), false : icône seule (cartes)
};

// Cœur : ajouter / retirer des favoris (aria-pressed indique l'état aux lecteurs d'écran)
export function FavoriteButton({ spotName, active, onToggle, withLabel = false }: FavoriteButtonProps) {
  // Texte décrivant l'action, selon que le lieu est déjà en favori ou non
  const label = active ? `Retirer ${spotName} des favoris` : `Ajouter ${spotName} aux favoris`;
  // L'icône cœur : remplie en vert (fill-current) quand le lieu est en favori
  const icon = <Icon name="heart" className={`size-5 ${active ? 'fill-current text-acid' : ''}`} />;

  // Version avec texte, pour la fiche détaillée
  if (withLabel) {
    return (
      <button type="button" onClick={onToggle} aria-pressed={active} className="btn btn-ghost self-start">
        {icon}
        {active ? 'Dans tes favoris' : 'Ajouter aux favoris'}
      </button>
    );
  }

  // Version icône seule, posée sur la photo des cartes
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={label} // texte lu par les lecteurs d'écran (le bouton n'a pas de texte visible)
      title={label} // texte affiché au survol de la souris
      className="grid size-11 shrink-0 place-items-center rounded-full bg-charcoal/85 text-mist backdrop-blur transition hover:text-acid"
    >
      {icon}
    </button>
  );
}
