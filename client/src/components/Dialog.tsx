// Fenêtre modale basée sur l'élément HTML natif <dialog>.
// showModal() gère pour nous le piège du focus, la touche Échap et l'arrière-plan.
// Utilisée pour le formulaire d'ajout/modification et pour la confirmation de suppression.
import { useEffect, useRef, type ReactNode } from 'react';

type DialogProps = {
  open: boolean; // true = fenêtre ouverte
  onClose: () => void; // fonction appelée quand la fenêtre se ferme
  labelledBy: string; // id du titre de la fenêtre (accessibilité)
  className?: string;
  children: ReactNode; // le contenu de la fenêtre
};

export function Dialog({ open, onClose, labelledBy, className = '', children }: DialogProps) {
  // useRef donne accès à l'élément <dialog> réel de la page (pour appeler showModal/close)
  const ref = useRef<HTMLDialogElement>(null);

  // À chaque changement de "open", on ouvre ou on ferme la fenêtre
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return; // l'élément n'existe pas encore
    if (open && !dialog.open) dialog.showModal(); // ouvrir
    if (!open && dialog.open) dialog.close(); // fermer
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      // onClose est déclenché par la touche Échap ou par dialog.close()
      onClose={onClose}
      // Clic sur l'arrière-plan (en dehors du contenu) : on ferme
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={`dialog-base ${className}`}
    >
      {/* Le contenu n'est affiché que lorsque la fenêtre est ouverte */}
      {open && children}
    </dialog>
  );
}
