// Notifications ("toasts") affichées après les actions CRUD.
// ToastProvider entoure l'application ; n'importe quel composant peut
// appeler showToast('success', 'Lieu ajouté') grâce au hook useToast().
// On utilise un "contexte" React : une donnée partagée par tous les composants à l'intérieur.
import { createContext, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '../components/Icon';

// Deux sortes de notifications : réussite (vert) ou erreur (rouge)
type ToastType = 'success' | 'error';

// Une notification affichée à l'écran
type Toast = {
  id: number; // numéro unique, pour pouvoir la retirer
  type: ToastType;
  message: string;
};

// Ce que le contexte met à disposition des composants : la fonction showToast
type ToastContextValue = {
  showToast: (type: ToastType, message: string) => void;
};

// Création du contexte (vide au départ, rempli par ToastProvider)
const ToastContext = createContext<ToastContextValue | null>(null);

// Compteur pour donner un numéro différent à chaque notification
let nextId = 1;

// Composant qui entoure l'application (voir App.tsx) et affiche les notifications.
// "children" = tout ce qui est placé à l'intérieur de <ToastProvider>...</ToastProvider>
export function ToastProvider({ children }: { children: ReactNode }) {
  // La liste des notifications affichées en ce moment
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Retire une notification : on garde toutes celles dont l'id est différent
  function removeToast(id: number) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  // Affiche une nouvelle notification, puis la retire automatiquement
  function showToast(type: ToastType, message: string) {
    const id = nextId++; // on prend le numéro suivant
    setToasts((current) => [...current, { id, type, message }]); // ajout à la fin de la liste
    setTimeout(() => removeToast(id), 5000); // disparaît après 5 secondes
  }

  return (
    // Le Provider rend showToast accessible à tous les composants à l'intérieur
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* aria-live : les lecteurs d'écran annoncent les nouveaux messages */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      >
        {/* AnimatePresence permet d'animer aussi la disparition des notifications */}
        <AnimatePresence initial={false}>
          {/* map() transforme chaque notification de la liste en un bloc affiché */}
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              role={toast.type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-charcoal/95 px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur ${
                toast.type === 'success' ? 'border-acid/40' : 'border-red-400/50'
              }`}
            >
              {/* Icône : coche verte pour une réussite, alerte rouge pour une erreur */}
              <span className={toast.type === 'success' ? 'mt-0.5 text-acid' : 'mt-0.5 text-red-300'}>
                <Icon name={toast.type === 'success' ? 'check' : 'alert'} />
              </span>
              <p className="flex-1 text-sm text-mist">{toast.message}</p>
              {/* Bouton pour fermer la notification sans attendre les 5 secondes */}
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="-m-2 grid size-11 shrink-0 place-items-center rounded-full text-ash hover:text-mist"
                aria-label="Fermer la notification"
              >
                <Icon name="x" className="size-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// Hook à utiliser dans un composant : const { showToast } = useToast();
export function useToast() {
  // useContext lit la valeur partagée par le ToastProvider le plus proche
  const context = useContext(ToastContext);
  // Si on a oublié le ToastProvider, on prévient clairement
  if (!context) throw new Error('useToast doit être utilisé dans un ToastProvider');
  return context;
}
