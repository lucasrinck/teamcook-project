// Petits badges réutilisables : catégorie et disponibilité.
// Chaque information est donnée par du TEXTE et une icône, jamais par la couleur seule.
import type { Category } from '../types/spot';
import { Icon } from './Icon';

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: category.color ?? undefined }}>
      <Icon name={category.icon ?? 'map-pin'} className="size-4" />
      {category.name}
    </span>
  );
}

export function AvailabilityBadge({ available }: { available: boolean }) {
  return available ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-charcoal/85 px-3 py-1 text-xs font-semibold text-acid backdrop-blur">
      <span className="size-1.5 rounded-full bg-acid" aria-hidden="true" />
      Disponible
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-charcoal/85 px-3 py-1 text-xs font-semibold text-ash backdrop-blur">
      <Icon name="x" className="size-3" />
      Indisponible
    </span>
  );
}

// Étiquette pour les données de démonstration
export function DemoTag() {
  return (
    <span className="inline-flex items-center rounded-full border border-volt/40 px-2.5 py-0.5 text-xs text-volt">
      Lieu fictif
    </span>
  );
}
