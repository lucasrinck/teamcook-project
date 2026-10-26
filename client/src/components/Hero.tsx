// Grand écran d'accueil de la page Explorer.
// Image décorative (Unsplash) : si elle ne charge pas, le dégradé reste visible.

// L'adresse de la photo de fond
const HERO_IMAGE = 'https://images.unsplash.com/photo-1500313830540-7b6650a74fd0?auto=format&fit=crop&w=2400&q=80';

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden">
      {/* Photo de fond, placée derrière le texte (-z-20) */}
      <img
        src={HERO_IMAGE}
        alt="" // image décorative : alt vide pour que les lecteurs d'écran l'ignorent
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[72%_50%] sm:object-center"
      />
      {/* Dégradé sombre par-dessus la photo, pour que le texte reste lisible */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,#101311_8%,rgba(16,19,17,0.75)_45%,rgba(16,19,17,0.35))]" />

      <div className="mx-auto w-full max-w-7xl px-4 pt-32 pb-16 sm:px-8 sm:pb-24">
        {/* clamp() : la taille du titre s'adapte à la largeur de l'écran, entre un minimum et un maximum */}
        <h1 className="font-display text-[clamp(3.75rem,13vw,11rem)] leading-[0.82] font-black tracking-[-0.01em] text-mist">
          La nuit cache
          <br />
          bien plus.
        </h1>

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
      </div>
    </section>
  );
}
