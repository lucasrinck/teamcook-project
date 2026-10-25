// Petits badges réutilisables : catégorie et lieu fictif.
// Chaque information est donnée par du TEXTE et une icône, jamais par la couleur seule.
import type { Category } from '../types/spot';
import { Icon } from './Icon';

// Affiche la catégorie d'un lieu : son icône + son nom, dans sa couleur.
// Les composants React reçoivent leurs données dans un objet appelé "props".
// "{ category }" récupère directement la propriété category de cet objet.
export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-medium"
      // style permet de mettre une couleur venant de la base (ex. "#8D78FF").
      // "?? undefined" : si la catégorie n'a pas de couleur, on garde la couleur par défaut.
      style={{ color: category.color ?? undefined }}
    >
      {/* Si la catégorie n'a pas d'icône, on affiche un repère de carte */}
      <Icon name={category.icon ?? 'map-pin'} className="size-4" />
      {category.name}
    </span>
  );
}

// Étiquette pour les données de démonstration (les lieux inventés du seed)
export function DemoTag() {
  return (
    <span className="inline-flex items-center rounded-full border border-volt/40 px-2.5 py-0.5 text-xs text-volt">
      Lieu fictif
    </span>
  );
}
