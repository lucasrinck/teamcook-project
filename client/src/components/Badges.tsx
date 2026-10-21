// Petits badges réutilisables : catégorie et lieu fictif.
// Chaque information est donnée par du TEXTE et une icône, jamais par la couleur seule.
import type { Category } from '../types/spot';
import { Icon } from './Icon';

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-medium"
      style={{ color: category.color ?? undefined }}
    >
      <Icon name={category.icon ?? 'map-pin'} className="size-4" />
      {category.name}
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
