// États de chargement, d'erreur et "vide", réutilisés sur les deux pages.
import type { ReactNode } from 'react';

// Indicateur de chargement : un simple texte.
// label a une valeur par défaut, on peut la changer : <Loader label="Patiente..." />
export function Loader({ label = 'Chargement des lieux…' }: { label?: string }) {
  return (
    // role="status" : les lecteurs d'écran annoncent que quelque chose charge
    <p role="status" className="py-24 text-center text-ash">
      {label}
    </p>
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
      <h3 className="font-display text-3xl font-bold text-mist">{title}</h3>
      {/* Le texte et le bouton ne s'affichent que s'ils ont été fournis */}
      {children && <div className="text-ash">{children}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
