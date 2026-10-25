// Control Room : la page qui démontre le CRUD complet.
// Chaque action appelle l'API Express, puis recharge les données depuis l'API.
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ApiError, createSpot, deleteSpot, updateSpot } from '../../services/api';
import { useSpots } from '../../hooks/useSpots';
import { useToast } from '../../hooks/useToast';
import type { Spot, SpotInput } from '../../types/spot';
import { Dialog } from '../Dialog';
import { Icon } from '../Icon';
import { Loader, StateMessage } from '../StateMessage';
import { AdminSpotRow } from './AdminSpotRow';
import { SpotForm } from './SpotForm';

type ControlRoomProps = {
  token: string; // le token admin, envoyé avec chaque requête d'écriture
  onLogout: () => void; // efface le token et revient à l'écran de déverrouillage
};

export function ControlRoom({ token, onLogout }: ControlRoomProps) {
  // Les lieux et catégories depuis l'API, + reload() pour recharger après une action
  const { spots, categories, status, error, reload, retry } = useSpots();
  // showToast() affiche une notification en bas de l'écran
  const { showToast } = useToast();

  const [formOpen, setFormOpen] = useState(false); // le formulaire est-il ouvert ?
  const [editingSpot, setEditingSpot] = useState<Spot | null>(null); // null = ajout, sinon le lieu modifié
  const [spotToDelete, setSpotToDelete] = useState<Spot | null>(null); // lieu en attente de confirmation
  const [busyId, setBusyId] = useState<number | null>(null); // id du lieu en cours de suppression

  // Erreur d'API commune : 401 = token refusé -> retour à l'écran de déverrouillage
  function handleApiError(err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      showToast('error', 'Token refusé : déverrouille à nouveau la Control Room.');
      onLogout();
      return;
    }
    // Pour les autres erreurs (400, 500...), on affiche le message reçu de l'API
    showToast('error', err instanceof Error ? err.message : 'Erreur inattendue.');
  }

  // Ouvre le formulaire vide, pour ajouter un lieu
  function openCreateForm() {
    setEditingSpot(null);
    setFormOpen(true);
  }

  // Ouvre le formulaire prérempli avec le lieu à modifier
  function openEditForm(spot: Spot) {
    setEditingSpot(spot);
    setFormOpen(true);
  }

  // CREATE (POST) ou UPDATE (PUT), appelée quand on valide le formulaire.
  // input contient les valeurs du formulaire, prêtes à être envoyées à l'API.
  async function handleSave(input: SpotInput) {
    try {
      if (editingSpot) {
        // On modifiait un lieu existant : PUT /api/spots/:id
        await updateSpot(editingSpot.id, input, token);
        showToast('success', `Modifications enregistrées pour « ${input.name.trim()} ».`);
      } else {
        // On ajoutait un nouveau lieu : POST /api/spots
        await createSpot(input, token);
        showToast('success', `Lieu ajouté : « ${input.name.trim()} ».`);
      }
      setFormOpen(false); // on ferme le formulaire
      await reload(); // et on recharge la liste depuis l'API pour voir le changement
    } catch (err) {
      handleApiError(err); // 400 : affiche le message du serveur (champs obligatoires)
    }
  }

  // DELETE, après confirmation
  async function handleConfirmDelete() {
    if (!spotToDelete) return;
    const spot = spotToDelete; // on garde le lieu de côté...
    setSpotToDelete(null); // ...puis on ferme la fenêtre de confirmation
    setBusyId(spot.id); // ses boutons sont désactivés pendant la suppression
    try {
      await deleteSpot(spot.id, token); // DELETE /api/spots/:id
      showToast('success', `Lieu supprimé : « ${spot.name} ».`);
      await reload();
    } catch (err) {
      handleApiError(err);
    } finally {
      setBusyId(null); // dans tous les cas, on réactive les boutons
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 sm:px-8 sm:py-14">
      {/* En-tête : titre + boutons "Ajouter un lieu" et "Se déconnecter" */}
      <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-6xl leading-none font-black text-mist sm:text-7xl">Control Room</h1>
          <p className="max-w-lg text-ash">
            Ajoute, modifie ou supprime les lieux. Chaque action est enregistrée dans la base via l'API.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Désactivé tant que les catégories ne sont pas chargées (le formulaire en a besoin) */}
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

      {/* Les 3 chiffres clés */}
      {status === 'ready' && (
        <dl className="grid grid-cols-2 divide-x divide-white/8 rounded-3xl border border-white/8">
          <Stat label="Lieux enregistrés" value={spots.length} />
          <Stat label="Catégories" value={categories.length} />
        </dl>
      )}

      {/* Chargement, erreur ou liste vide : un seul de ces blocs s'affiche */}
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

      {/* La liste des lieux : une ligne par lieu, avec ses boutons Modifier / Supprimer */}
      {status === 'ready' && spots.length > 0 && (
        <ul className="flex flex-col gap-3" aria-label="Lieux enregistrés">
          <AnimatePresence initial={false}>
            {spots.map((spot) => (
              <AdminSpotRow
                key={spot.id}
                spot={spot}
                busy={busyId === spot.id}
                onEdit={openEditForm}
                // "Supprimer" ne supprime pas tout de suite : il ouvre la fenêtre de confirmation
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
          {/* key : quand on change de lieu, React recrée le formulaire avec les bonnes valeurs */}
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
              {/* autoFocus : le focus va sur "Annuler", pour éviter une suppression par erreur */}
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

// Un chiffre clé : un libellé (ex. "Villes") et sa valeur (ex. 1).
// <dt> et <dd> sont les balises HTML prévues pour un terme et sa définition.
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-5 sm:px-6">
      <dt className="text-sm text-ash">{label}</dt>
      <dd className="font-display text-5xl leading-none font-extrabold text-mist">{value}</dd>
    </div>
  );
}
