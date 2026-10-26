// Éléments communs aux pages : logo, navigation et pied de page.
// Link : un lien vers une autre page du site sans recharger la page.
// NavLink : pareil, mais il sait si sa page est la page actuelle (pour la mettre en valeur).
import { Link, NavLink } from 'react-router';

// Le logo : simplement le mot AFTERDARK, écrit avec la police des titres
export function Logo() {
  return <span className="font-display text-xl font-extrabold tracking-[0.08em] text-mist sm:text-2xl">AFTERDARK</span>;
}

// Calcule les classes CSS d'un lien de navigation.
// NavLink appelle cette fonction en lui disant si le lien est actif (page actuelle).
function navLinkClass({ isActive }: { isActive: boolean }) {
  return `inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium whitespace-nowrap transition sm:px-4 ${
    isActive ? 'bg-mist/10 text-mist' : 'text-ash hover:text-mist'
  }`;
}

// Barre de navigation en haut de page.
// overlay = true : la barre est posée par-dessus le hero (page Explorer).
export function Navbar({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={overlay ? 'absolute inset-x-0 top-0 z-20' : 'border-b border-white/6'}>
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:px-8"
      >
        {/* Le logo ramène à l'accueil */}
        <Link to="/" className="rounded-lg" aria-label="AFTERDARK, retour à l'accueil">
          <Logo />
        </Link>
        <ul className="flex items-center gap-1">
          <li>
            {/* "end" : ce lien n'est actif que sur "/" exactement (pas sur "/admin") */}
            <NavLink to="/" end className={navLinkClass}>
              Explorer
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin" className={navLinkClass}>
              Control Room
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}

// Pied de page : logo, slogan et mention "données fictives"
export function Footer() {
  return (
    <footer className="border-t border-white/6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-ash sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div className="flex flex-col gap-2">
          <Logo />
          <p>Your city. Your night. Your story.</p>
        </div>
        <p className="max-w-md sm:text-right">
          Projet étudiant. Les lieux et descriptions affichés sont fictifs et servent uniquement à la démonstration.
          Photos : Unsplash.
        </p>
      </div>
    </footer>
  );
}
