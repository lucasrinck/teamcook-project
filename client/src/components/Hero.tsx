// Grand écran d'accueil de la page Explorer.
// Image décorative (Unsplash) : si elle ne charge pas, le dégradé reste visible.
import { motion } from 'framer-motion';
import { EASE_OUT } from './Motion';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1500313830540-7b6650a74fd0?auto=format&fit=crop&w=2400&q=80';

// Chaque ligne du titre monte depuis un "masque" (overflow-hidden), l'une après l'autre
const TITLE_LINES = ['La nuit cache', 'bien plus.'];

type HeroProps = {
  ready: boolean; // false pendant l'intro : les animations attendent qu'elle se termine
};

export function Hero({ ready }: HeroProps) {
  // Nom de l'état d'animation à afficher : "visible" une fois l'intro finie, "hidden" avant
  const state = ready ? 'visible' : 'hidden';

  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden">
      {/* Photo de fond : elle part légèrement zoomée (1.08) et revient à sa taille (1) */}
      <motion.img
        src={HERO_IMAGE}
        alt="" // image décorative : alt vide pour que les lecteurs d'écran l'ignorent
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[72%_50%] sm:object-center"
        initial={{ scale: 1.08 }}
        animate={{ scale: ready ? 1 : 1.08 }}
        transition={{ duration: 2.4, ease: EASE_OUT }}
      />
      {/* Dégradé sombre par-dessus la photo, pour que le texte reste lisible */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,#101311_8%,rgba(16,19,17,0.75)_45%,rgba(16,19,17,0.35))]" />
      {/* Deux halos de lumière floue qui bougent lentement (animation CSS dans index.css) */}
      <div className="hero-glow hero-glow-violet absolute -z-10" aria-hidden="true" />
      <div className="hero-glow hero-glow-acid absolute -z-10" aria-hidden="true" />

      <div className="mx-auto w-full max-w-7xl px-4 pt-32 pb-16 sm:px-8 sm:pb-24">
        <h1 className="font-display text-[clamp(3.75rem,13vw,11rem)] leading-[0.82] font-black tracking-[-0.01em] text-mist">
          {/* Pour chaque ligne du titre : un cadre qui cache ce qui dépasse, et le texte qui monte dedans */}
          {TITLE_LINES.map((line, index) => (
            <span key={line} className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
              <motion.span
                className="block"
                initial="hidden"
                animate={state}
                // variants : les deux positions possibles du texte (caché sous le cadre, ou en place)
                variants={{ hidden: { y: '105%' }, visible: { y: 0 } }}
                // La 2e ligne démarre un peu après la 1re (index * 0.12 seconde)
                transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.15 + index * 0.12 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* Sous-titre et bouton : apparaissent en fondu juste après le titre */}
        <motion.div
          initial="hidden"
          animate={state}
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.55 }}
        >
          <p className="mt-10 max-w-xl text-lg leading-relaxed text-mist/80 sm:text-xl">
            Des lieux secrets. Des nuits inattendues. Ta prochaine histoire commence ici.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            {/* Lien vers la section #explorer, plus bas dans la page */}
            <a href="#explorer" className="btn btn-primary">
              Explorer la carte
            </a>
            <p className="text-ash">Your city. Your night. Your story.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
