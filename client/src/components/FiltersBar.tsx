// Barre de recherche et de filtres de la page Explorer.
// Elle ne filtre rien elle-même : elle modifie l'objet "filters" du parent,
// qui recalcule la liste avec filterSpots().
import { useState } from 'react';
import type { Category, SpotFilters } from '../types/spot';
import { countActiveFilters, EMPTY_FILTERS } from '../utils/spots';
import { Icon } from './Icon';

type FiltersBarProps = {
  filters: SpotFilters;
  onChange: (filters: SpotFilters) => void;
  categories: Category[];
  cities: string[];
  favoritesCount: number;
};

export function FiltersBar({ filters, onChange, categories, cities, favoritesCount }: FiltersBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false); // panneau des filtres en mobile
  const activeCount = countActiveFilters(filters);

  // Modifie un seul filtre en gardant les autres
  function update(changes: Partial<SpotFilters>) {
    onChange({ ...filters, ...changes });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <label className="relative flex-1">
          <span className="sr-only">Rechercher un lieu par son nom</span>
          <Icon
            name="search"
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ash"
          />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => update({ search: event.target.value })}
            placeholder="Rechercher un lieu…"
            className="field-input pl-12"
          />
        </label>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="filters-panel"
          className="btn btn-ghost lg:hidden"
        >
          <Icon name="sliders" />
          Filtres{activeCount > 0 && ` (${activeCount})`}
        </button>
      </div>

      <div id="filters-panel" className={`${mobileOpen ? 'flex' : 'hidden'} flex-col gap-4 lg:flex`}>
        {/* Catégories : boutons "puces", un seul choix à la fois */}
        <div
          role="group"
          aria-label="Filtrer par catégorie"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0"
        >
          <button
            type="button"
            aria-pressed={filters.categoryId === null}
            onClick={() => update({ categoryId: null })}
            className="chip"
          >
            Toutes
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={filters.categoryId === category.id}
              onClick={() => update({ categoryId: filters.categoryId === category.id ? null : category.id })}
              className="chip"
            >
              <span style={{ color: category.color ?? undefined }}>
                <Icon name={category.icon ?? 'map-pin'} className="size-4" />
              </span>
              {category.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-ash">
            Ville
            <select
              value={filters.city}
              onChange={(event) => update({ city: event.target.value })}
              className="field-input w-auto py-2.5"
            >
              <option value="">Toutes les villes</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-mist">
            <input
              type="checkbox"
              checked={filters.onlyFavorites}
              onChange={(event) => update({ onlyFavorites: event.target.checked })}
              className="switch"
            />
            Mes favoris ({favoritesCount})
          </label>

          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            disabled={activeCount === 0}
            className="btn btn-link ml-auto"
          >
            <Icon name="refresh" className="size-4" />
            Réinitialiser les filtres
          </button>
        </div>
      </div>
    </div>
  );
}
