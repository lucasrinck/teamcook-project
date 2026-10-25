// États de chargement, d'erreur et "vide", réutilisés sur les deux pages.
import type { ReactNode } from 'react';
import { Icon } from './Icon';

// Indicateur de chargement : une petite lune qui tourne + un texte.
// label a une valeur par défaut, on peut la changer : <Loader label="Patiente..." />
export function Loader({ label = 'Chargement des lieux…' }: { label?: string }) {
  return (
    // role="status" : les lecteurs d'écran annoncent que quelque chose charge
    <div role="status" className="flex flex-col items-center justify-center gap-5 py-24 text-ash">
      {/* L'animation est faite en CSS (classe loader-orbit dans styles/index.css) */}
      <span className="loader-orbit" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

// Les props du message
type StateMessageProps = {
  tone?: 'neutral' | 'error'; // neutre (vert) ou erreur (rouge)
  title: string; // le titre du message
  children?: ReactNode; // le texte placé entre <StateMessage> et </StateMessage>
  action?: ReactNode; // un bouton facultatif (ex. "Réessayer")
};

// Bloc de message centré : "aucun lieu", "erreur de chargement", etc.
export function StateMessage({ tone = 'neutral', title, children, action }: StateMessageProps) {
  return (
    <div
      // Pour une erreur, role="alert" la fait lire tout de suite par les lecteurs d'écran
      role={tone === 'error' ? 'alert' : undefined}
      className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-[1.75rem] border border-white/8 bg-forest/40 px-6 py-14 text-center"
    >
      {/* Icône et couleur différentes selon le ton du message */}
      <span className={tone === 'error' ? 'text-red-300' : 'text-acid'}>
        <Icon name={tone === 'error' ? 'alert' : 'moon-star'} className="size-8" />
      </span>
      <h3 className="font-display text-3xl font-bold text-mist">{title}</h3>
      {/* Le texte et le bouton ne s'affichent que s'ils ont été fournis */}
      {children && <div className="text-ash">{children}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
