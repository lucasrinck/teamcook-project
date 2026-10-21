// Notifications ("toasts") affichées après les actions CRUD.
// ToastProvider entoure l'application ; n'importe quel composant peut
// appeler showToast('success', 'Lieu ajouté') grâce au hook useToast().
import { createContext, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '../components/Icon';

type ToastType = 'success' | 'error';

type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  showToast: (type: ToastType, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function removeToast(id: number) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function showToast(type: ToastType, message: string) {
    const id = nextId++;
    setToasts((current) => [...current, { id, type, message }]);
    setTimeout(() => removeToast(id), 5000); // disparaît après 5 secondes
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* aria-live : les lecteurs d'écran annoncent les nouveaux messages */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      >
        <AnimatePresence initial={false}>
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
              <span className={toast.type === 'success' ? 'mt-0.5 text-acid' : 'mt-0.5 text-red-300'}>
                <Icon name={toast.type === 'success' ? 'check' : 'alert'} />
              </span>
              <p className="flex-1 text-sm text-mist">{toast.message}</p>
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

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast doit être utilisé dans un ToastProvider');
  return context;
}
