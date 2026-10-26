// Barre de recherche et de filtre de la page Explorer.
// Elle ne filtre rien elle-même : elle modifie l'objet "filters" du parent,
// qui recalcule la liste avec filterSpots().
import type { Category, SpotFilters } from '../types/spot';
import { EMPTY_FILTERS } from '../utils/spots';

type FiltersBarProps = {
  filters: SpotFilters; // les filtres actuels
  onChange: (filters: SpotFilters) => void; // appelé avec les nouveaux filtres à chaque changement
  categories: Category[]; // pour remplir la liste déroulante
};

export function FiltersBar({ filters, onChange, categories }: FiltersBarProps) {
  // Au moins un filtre est utilisé ? (pour afficher le bouton "Réinitialiser")
  const hasFilter = filters.search !== '' || filters.categoryId !== null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {/* Recherche par nom : on copie les filtres ({ ...filters }) en changeant seulement search */}
      <label className="flex-1">
        <span className="sr-only">Rechercher un lieu par son nom</span>
        <input
          type="search"
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder="Rechercher un lieu…"
          className="field-input"
        />
      </label>

      {/* Catégorie : "" = toutes (null), sinon on transforme la valeur (un texte) en nombre */}
      <label>
        <span className="sr-only">Filtrer par catégorie</span>
        <select
          value={filters.categoryId ?? ''}
          onChange={(event) =>
            onChange({ ...filters, categoryId: event.target.value === '' ? null : Number(event.target.value) })
          }
          className="field-input sm:w-64"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      {/* Remet les filtres à zéro, affiché seulement si un filtre est utilisé */}
      {hasFilter && (
        <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="btn btn-ghost">
          Réinitialiser
        </button>
      )}
    </div>
  );
}
