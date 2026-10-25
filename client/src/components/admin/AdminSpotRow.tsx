// Une ligne de la liste des lieux dans la Control Room, avec ses actions.
import { motion } from 'framer-motion';
import type { Spot } from '../../types/spot';
import { formatLocation } from '../../utils/spots';
import { CategoryBadge } from '../Badges';
import { Icon } from '../Icon';
import { SpotImage } from '../SpotImage';

type AdminSpotRowProps = {
  spot: Spot; // le lieu affiché sur cette ligne
  busy: boolean; // une action est en cours sur ce lieu
  onEdit: (spot: Spot) => void; // clic sur "Modifier"
  onDelete: (spot: Spot) => void; // clic sur "Supprimer" (ouvre la confirmation)
};

export function AdminSpotRow({ spot, busy, onEdit, onDelete }: AdminSpotRowProps) {
  return (
    // layout + exit : la ligne disparaît en douceur après une suppression, les autres remontent
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4 rounded-3xl border border-white/8 bg-forest/40 p-4 md:flex-row md:items-center"
    >
      {/* Partie gauche : miniature, nom, catégorie et adresse */}
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <SpotImage
          src={spot.images[0]}
          alt={`Photo : ${spot.name}`}
          className="size-16 shrink-0 rounded-2xl object-cover"
          compact
        />
        <div className="flex min-w-0 flex-col gap-1">
          {/* truncate : si le nom est trop long, il est coupé avec "..." */}
          <p className="truncate font-display text-2xl leading-none font-bold text-mist">{spot.name}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <CategoryBadge category={spot.category} />
            <span className="truncate text-sm text-ash">{formatLocation(spot) || 'Sans localisation'}</span>
          </div>
        </div>
      </div>

      {/* Partie droite : les boutons d'action (désactivés pendant une action en cours) */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onEdit(spot)} disabled={busy} className="btn btn-ghost">
          <Icon name="pencil" className="size-4" />
          Modifier
          <span className="sr-only"> {spot.name}</span>
        </button>
        <button type="button" onClick={() => onDelete(spot)} disabled={busy} className="btn btn-danger">
          <Icon name="trash" className="size-4" />
          Supprimer
          <span className="sr-only"> {spot.name}</span>
        </button>
      </div>
    </motion.li>
  );
}
