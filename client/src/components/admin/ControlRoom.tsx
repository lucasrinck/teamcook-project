// Control Room : la page qui démontre le CRUD complet.
// Chaque action appelle l'API Express, puis recharge les données depuis l'API.
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ApiError, createSpot, deleteSpot, updateSpot } from '../../services/api';
import { useSpots } from '../../hooks/useSpots';
import { useToast } from '../../hooks/useToast';
import type { Spot, SpotInput } from '../../types/spot';
import { getCities } from '../../utils/spots';
import { Dialog } from '../Dialog';
import { Icon } from '../Icon';
import { Loader, StateMessage } from '../StateMessage';
import { AdminSpotRow } from './AdminSpotRow';
import { SpotForm } from './SpotForm';

type ControlRoomProps = {
  token: string;
  onLogout: () => void;
};

export function ControlRoom({ token, onLogout }: ControlRoomProps) {
  const { spots, categories, status, error, reload, retry } = useSpots();
  const { showToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState<Spot | null>(null); // null = ajout
  const [spotToDelete, setSpotToDelete] = useState<Spot | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Erreur d'API commune : 401 = token refusé -> retour à l'écran de déverrouillage
  function handleApiError(err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      showToast('error', 'Token refusé : déverrouille à nouveau la Control Room.');
      onLogout();
      return;
    }
    showToast('error', err instanceof Error ? err.message : 'Erreur inattendue.');
  }

  function openCreateForm() {
    setEditingSpot(null);
    setFormOpen(true);
  }

  function openEditForm(spot: Spot) {
    setEditingSpot(spot);
    setFormOpen(true);
  }

  // CREATE (POST) ou UPDATE (PUT)
  async function handleSave(input: SpotInput) {
    try {
      if (editingSpot) {
        await updateSpot(editingSpot.id, input, token);
        showToast('success', `Modifications enregistrées pour « ${input.name.trim()} ».`);
      } else {
        await createSpot(input, token);
        showToast('success', `Lieu ajouté : « ${input.name.trim()} ».`);
      }
      setFormOpen(false);
      await reload();
    } catch (err) {
      handleApiError(err); // 400 : affiche le message du serveur (champs obligatoires)
    }
  }

  // DELETE, après confirmation
  async function handleConfirmDelete() {
    if (!spotToDelete) return;
    const spot = spotToDelete;
    setSpotToDelete(null);
    setBusyId(spot.id);
    try {
      await deleteSpot(spot.id, token);
      showToast('success', `Lieu supprimé : « ${spot.name} ».`);
      await reload();
    } catch (err) {
      handleApiError(err);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-6xl leading-none font-black text-mist sm:text-7xl">Control Room</h1>
          <p className="max-w-lg text-ash">
            Ajoute, modifie ou supprime les lieux. Chaque action est enregistrée dans la base via l'API.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={openCreateForm} disabled={status !== 'ready'} className="btn btn-primary">
            <Icon name="plus" />
            Ajouter un lieu
          </button>
          <button type="button" onClick={onLogout} className="btn btn-ghost">
            <Icon name="logout" />
            Se déconnecter
          </button>
        </div>
      </header>

      {status === 'ready' && (
        <dl className="grid grid-cols-3 divide-x divide-white/8 rounded-3xl border border-white/8">
          <Stat label="Lieux enregistrés" value={spots.length} />
          <Stat label="Catégories" value={categories.length} />
          <Stat label="Villes" value={getCities(spots).length} />
        </dl>
      )}

      {status === 'loading' && <Loader />}

      {status === 'error' && (
        <StateMessage
          tone="error"
          title="Impossible de charger les lieux"
          action={
            <button type="button" onClick={retry} className="btn btn-primary">
              Réessayer
            </button>
          }
        >
          {error}
        </StateMessage>
      )}

      {status === 'ready' && spots.length === 0 && (
        <StateMessage
          title="Aucun lieu enregistré"
          action={
            <button type="button" onClick={openCreateForm} className="btn btn-primary">
              Ajouter le premier lieu
            </button>
          }
        >
          La carte est vide. Ajoute un lieu pour la remplir.
        </StateMessage>
      )}

      {status === 'ready' && spots.length > 0 && (
        <ul className="flex flex-col gap-3" aria-label="Lieux enregistrés">
          <AnimatePresence initial={false}>
            {spots.map((spot) => (
              <AdminSpotRow
                key={spot.id}
                spot={spot}
                busy={busyId === spot.id}
                onEdit={openEditForm}
                onDelete={setSpotToDelete}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* Formulaire d'ajout / de modification (panneau latéral) */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} labelledBy="form-title" className="dialog-drawer">
        <div className="flex items-center justify-between gap-4 border-b border-white/8 px-6 py-5">
          <h2 id="form-title" className="font-display text-4xl leading-none font-extrabold text-mist">
            {editingSpot ? 'Modifier le lieu' : 'Nouveau lieu'}
          </h2>
          <button
            type="button"
            onClick={() => setFormOpen(false)}
            className="btn btn-ghost px-3"
            aria-label="Fermer le formulaire"
          >
            <Icon name="x" />
          </button>
        </div>
        <div className="px-6 pt-6">
          <SpotForm
            key={editingSpot?.id ?? 'new'}
            spot={editingSpot}
            categories={categories}
            onSubmit={handleSave}
            onCancel={() => setFormOpen(false)}
          />
        </div>
      </Dialog>

      {/* Confirmation de suppression */}
      <Dialog
        open={spotToDelete !== null}
        onClose={() => setSpotToDelete(null)}
        labelledBy="delete-title"
        className="dialog-center"
      >
        {spotToDelete && (
          <div className="flex flex-col gap-4 p-6">
            <h2 id="delete-title" className="font-display text-4xl leading-none font-extrabold text-mist">
              Supprimer « {spotToDelete.name} » ?
            </h2>
            <p className="text-ash">
              Le lieu et sa localisation seront définitivement supprimés de la base. Cette action est irréversible.
            </p>
            <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setSpotToDelete(null)} className="btn btn-ghost" autoFocus>
                Annuler
              </button>
              <button type="button" onClick={handleConfirmDelete} className="btn btn-danger-solid">
                Supprimer le lieu
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-5 sm:px-6">
      <dt className="text-sm text-ash">{label}</dt>
      <dd className="font-display text-5xl leading-none font-extrabold text-mist">{value}</dd>
    </div>
  );
}
