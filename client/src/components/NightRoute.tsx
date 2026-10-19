// Night Route : les lieux choisis par l'utilisateur, dans l'ordre, reliés sur la carte.
// Le parcours n'est pas enregistré : il vit seulement dans l'état React de la page.
import type { Spot } from '../types/spot';
import { CategoryBadge } from './Badges';
import { Icon } from './Icon';

type NightRouteProps = {
  stops: Spot[]; // les étapes, dans l'ordre
  onRemove: (id: number) => void;
  onClear: () => void;
};

export function NightRoute({ stops, onRemove, onClear }: NightRouteProps) {
  return (
    <section
      aria-labelledby="night-route-title"
      className="flex flex-col gap-4 rounded-[1.75rem] border border-volt/30 bg-volt/[0.06] p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3
          id="night-route-title"
          className="flex items-center gap-2 font-display text-3xl leading-none font-extrabold text-mist"
        >
          <Icon name="route" className="size-6 text-volt" />
          Ta Night Route
          <span className="font-sans text-base font-medium text-ash">
            ({stops.length} étape{stops.length > 1 ? 's' : ''})
          </span>
        </h3>
        <button type="button" onClick={onClear} className="btn btn-link">
          <Icon name="x" className="size-4" />
          Vider la route
        </button>
      </div>

      <ol className="flex flex-wrap gap-2">
        {stops.map((spot, index) => (
          <li
            key={spot.id}
            className="flex items-center gap-3 rounded-full border border-white/10 bg-charcoal/70 py-1 pr-1 pl-1.5"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-volt text-sm font-bold text-charcoal">
              {index + 1}
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-mist">{spot.name}</span>
              <span className="text-xs">
                <CategoryBadge category={spot.category} />
              </span>
            </span>
            <button
              type="button"
              onClick={() => onRemove(spot.id)}
              aria-label={`Retirer ${spot.name} de la route`}
              className="grid size-11 place-items-center rounded-full text-ash hover:text-mist"
            >
              <Icon name="x" className="size-4" />
            </button>
          </li>
        ))}
      </ol>

      <p className="text-sm text-ash">
        {stops.length < 2
          ? 'Ajoute au moins une autre étape pour tracer le parcours sur la carte.'
          : "Sur la carte, la ligne relie les étapes à vol d'oiseau : elle ne suit pas les rues."}
      </p>
    </section>
  );
}
