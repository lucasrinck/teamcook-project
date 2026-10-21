// Éléments communs aux pages : logo, navigation et pied de page.
import { useId } from 'react';
import { Link, NavLink } from 'react-router';

export function Logo() {
  const maskId = useId(); // identifiant unique : le logo apparaît plusieurs fois sur la page
  return (
    <span className="flex items-center gap-2.5">
      {/* Lune éclipsée : le symbole d'AFTERDARK */}
      <svg viewBox="0 0 32 32" className="size-7 shrink-0" aria-hidden="true">
        <mask id={maskId}>
          <rect width="32" height="32" fill="white" />
          <circle cx="21" cy="12" r="9" fill="black" />
        </mask>
        <circle cx="16" cy="16" r="11" fill="#D4FF70" mask={`url(#${maskId})`} />
      </svg>
      <span className="font-display text-xl font-extrabold tracking-[0.08em] text-mist sm:text-2xl">AFTERDARK</span>
    </span>
  );
}

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium whitespace-nowrap transition sm:px-4 ${
    isActive ? 'bg-mist/10 text-mist' : 'text-ash hover:text-mist'
  }`;
}

export function Navbar({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={overlay ? 'absolute inset-x-0 top-0 z-20' : 'border-b border-white/6'}>
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:px-8"
      >
        <Link to="/" className="rounded-lg" aria-label="AFTERDARK, retour à l'accueil">
          <Logo />
        </Link>
        <ul className="flex items-center gap-1">
          <li>
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
