// Image d'un lieu avec un visuel de remplacement si l'URL est vide ou ne charge pas.
import { useState } from 'react';
import { Icon } from './Icon';

type SpotImageProps = {
  src: string | undefined;
  alt: string;
  className?: string;
  compact?: boolean; // miniature : icône seule, sans texte
};

export function SpotImage({ src, alt, className = '', compact = false }: SpotImageProps) {
  // On mémorise l'URL qui a échoué : si src change, on retente le chargement
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div
        role="img"
        aria-label={`${alt} (image indisponible)`}
        className={`flex flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_30%_20%,#2b372c,#101311_70%)] text-ash ${className}`}
      >
        <Icon name="image" className={compact ? 'size-5' : 'size-7'} />
        {!compact && <span className="text-xs">Image indisponible</span>}
      </div>
    );
  }

  return <img src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} className={className} />;
}
