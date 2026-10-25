// Animations réutilisables (Framer Motion).
// Rappel : <MotionConfig reducedMotion="user"> dans App.tsx coupe les déplacements
// quand le système demande de réduire les animations (prefers-reduced-motion).
import { useEffect, type ReactNode } from 'react';
// motion : version "animable" des balises HTML (motion.div, motion.p...)
import { motion } from 'framer-motion';

// Courbe d'accélération commune : départ rapide, arrivée très douce
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

type RevealProps = {
  children: ReactNode; // le contenu à faire apparaître
  className?: string;
  delay?: number; // délai avant l'animation, en secondes
};

// Fait apparaître un bloc (titre, en-tête...) quand il entre dans l'écran, une seule fois
export function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }} // état de départ : transparent (opacité 0) et 24 px plus bas
      whileInView={{ opacity: 1, y: 0 }} // quand il est visible à l'écran : opaque et à sa place
      viewport={{ once: true, margin: '-60px' }} // une seule fois, un peu après l'entrée dans l'écran
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}

// ---------- Introduction (facultative, une fois par session) ----------

// Nom sous lequel on retient, dans sessionStorage, que l'intro a déjà été vue
const INTRO_KEY = 'afterdark-intro-seen';

// L'intro ne se joue pas si l'utilisateur l'a déjà vue dans cet onglet,
// ni s'il a demandé à réduire les animations.
// Renvoie true si l'intro doit être jouée.
export function shouldPlayIntro() {
  // matchMedia vérifie un réglage du système : ici "réduire les animations"
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    // getItem renvoie null si l'intro n'a jamais été vue dans cet onglet
    return sessionStorage.getItem(INTRO_KEY) === null;
  } catch {
    return false;
  }
}

// Retient que l'intro a été vue, pour ne pas la rejouer dans cet onglet
function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_KEY, '1');
  } catch {
    // stockage indisponible : l'intro pourra se rejouer, ce n'est pas grave
  }
}

// Une lune pleine se fait éclipser jusqu'à devenir le croissant du logo : la nuit tombe.
// onDone : fonction appelée quand l'intro est terminée (la page affiche alors le hero)
export function Intro({ onDone }: { onDone: () => void }) {
  // Termine l'intro : on retient qu'elle a été vue, puis on prévient la page
  function finish() {
    markIntroSeen();
    onDone();
  }

  useEffect(() => {
    const timer = setTimeout(finish, 2100); // l'intro se termine seule après 2,1 secondes
    // La touche Échap permet aussi de passer l'intro
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') finish();
    }
    window.addEventListener('keydown', handleKey);
    // La fonction renvoyée par useEffect sert à "nettoyer" quand l'intro disparaît :
    // on annule le minuteur et on retire l'écoute du clavier.
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKey);
    };
  }, []); // une seule fois, au montage de l'intro

  return (
    <motion.div
      className="fixed inset-0 z-[100] grid place-items-center bg-charcoal"
      exit={{ y: '-100%' }} // en partant, l'écran d'intro remonte et sort par le haut
      transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="flex flex-col items-center gap-6" aria-hidden="true">
        <svg viewBox="0 0 32 32" className="size-20 overflow-visible">
          <defs>
            {/* Masque : le cercle noir qui glisse cache peu à peu la lune */}
            <mask id="intro-eclipse">
              <rect x="-20" y="-20" width="72" height="72" fill="white" />
              <motion.circle
                r="9"
                cy="12"
                fill="black"
                initial={{ cx: -6 }} // départ : à gauche, en dehors de la lune
                animate={{ cx: 21 }} // arrivée : sur la lune, il ne reste qu'un croissant
                transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.15 }}
              />
            </mask>
          </defs>
          <circle cx="16" cy="16" r="11" fill="#D4FF70" mask="url(#intro-eclipse)" />
        </svg>
        {/* Le nom apparaît en se resserrant (l'espace entre les lettres diminue) */}
        <motion.p
          className="font-display text-5xl font-extrabold text-mist sm:text-6xl"
          initial={{ opacity: 0, letterSpacing: '0.5em' }}
          animate={{ opacity: 1, letterSpacing: '0.1em' }}
          transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.45 }}
        >
          AFTERDARK
        </motion.p>
      </div>
      <button type="button" onClick={finish} className="btn btn-ghost absolute right-4 bottom-4 sm:right-8 sm:bottom-8">
        Passer l'intro
      </button>
    </motion.div>
  );
}
