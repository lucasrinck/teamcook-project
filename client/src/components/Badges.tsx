// Badge de catégorie : le nom de la catégorie, écrit dans sa couleur.
// L'information est donnée par le TEXTE : la couleur n'est qu'un bonus visuel.
import type { Category } from '../types/spot';

export function CategoryBadge({ category }: { category: Category }) {
  return (
    // La couleur vient de la base (categories.color). "?? undefined" : pas de couleur si elle est vide.
    <span className="text-sm font-medium" style={{ color: category.color ?? undefined }}>
      {category.name}
    </span>
  );
}
