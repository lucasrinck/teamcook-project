// Image d'un lieu avec un visuel de remplacement si l'URL est vide ou ne charge pas.
import { useState } from 'react';
import { Icon } from './Icon';

// Les props (données) que le composant accepte
type SpotImageProps = {
  src: string | undefined; // l'adresse de l'image (peut être absente)
  alt: string; // texte alternatif, lu par les lecteurs d'écran
  className?: string; // classes CSS à appliquer
  compact?: boolean; // miniature : icône seule, sans texte
};

// "className = ''" et "compact = false" sont des valeurs par défaut si on ne les donne pas
export function SpotImage({ src, alt, className = '', compact = false }: SpotImageProps) {
  // On mémorise l'URL qui a échoué : si src change, on retente le chargement
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  // Pas d'URL, ou l'image n'a pas pu se charger : on affiche un visuel de remplacement
  if (!src || failedSrc === src) {
    return (
      <div
        role="img"
        aria-label={`${alt} (image indisponible)`}
        className={`flex flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_30%_20%,#2b372c,#101311_70%)] text-ash ${className}`}
      >
        <Icon name="image" className={compact ? 'size-5' : 'size-7'} />
        {/* "condition && <élément>" : l'élément n'est affiché que si la condition est vraie */}
        {!compact && <span className="text-xs">Image indisponible</span>}
      </div>
    );
  }

  // Cas normal : l'image.
  // loading="lazy" : le navigateur ne la charge que lorsqu'elle approche de l'écran.
  // onError : appelé si l'image ne se charge pas -> on retient son URL pour afficher le remplacement.
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} className={className} />;
}
