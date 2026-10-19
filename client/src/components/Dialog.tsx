// Fenêtre modale basée sur l'élément HTML natif <dialog>.
// showModal() gère pour nous le piège du focus, la touche Échap et l'arrière-plan.
import { useEffect, useRef, type ReactNode } from 'react';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  labelledBy: string; // id du titre de la fenêtre (accessibilité)
  className?: string;
  children: ReactNode;
};

export function Dialog({ open, onClose, labelledBy, className = '', children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      // Clic sur l'arrière-plan (en dehors du contenu) : on ferme
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={`dialog-base ${className}`}
    >
      {open && children}
    </dialog>
  );
}
