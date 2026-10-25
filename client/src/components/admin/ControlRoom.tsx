// Control Room : la page qui démontre le CRUD complet.
// En haut le formulaire (ajout ou modification), en dessous la liste des lieux.
// Chaque action appelle l'API Express, puis recharge les données depuis l'API.
import { useState } from 'react';
import { ApiError, createSpot, deleteSpot, updateSpot } from '../../services/api';
import { useSpots } from '../../hooks/useSpots';
import type { Spot, SpotInput } from '../../types/spot';
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

  const [editingSpot, setEditingSpot] = useState<Spot | null>(null); // null = ajout, sinon le lieu modifié
  const [formError, setFormError] = useState(''); // message d'erreur du serveur ("" = aucun)
  const [busyId, setBusyId] = useState<number | null>(null); // id du lieu en cours de suppression

  // Erreur d'API commune : 401 = token refusé -> retour à l'écran de déverrouillage.
  // Sinon on affiche le message envoyé par le serveur (ex. 400 : champ obligatoire vide).
  function handleApiError(err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      onLogout();
      return;
    }
    setFormError(err instanceof Error ? err.message : 'Erreur inattendue.');
  }

  // "Modifier" : le formulaire se remplit avec ce lieu, et la page remonte jusqu'à lui
  function startEdit(spot: Spot) {
    setEditingSpot(spot);
    setFormError('');
    document.getElementById('spot-form')?.scrollIntoView();
  }

  // "Annuler" : le formulaire repasse en mode ajout
  function cancelEdit() {
    setEditingSpot(null);
    setFormError('');
  }

  // CREATE (POST) ou UPDATE (PUT). Renvoie true si c'est réussi (le formulaire se vide alors).
  async function handleSave(input: SpotInput) {
    try {
      if (editingSpot) {
        await updateSpot(editingSpot.id, input, token);
      } else {
        await createSpot(input, token);
      }
      setEditingSpot(null);
      setFormError('');
      await reload(); // on relit la liste depuis l'API
      return true;
    } catch (err) {
      handleApiError(err);
      return false;
    }
  }

  // DELETE, après confirmation du navigateur
  async function handleDelete(spot: Spot) {
    // window.confirm() affiche une boîte "OK / Annuler" et renvoie true si on clique sur OK
    if (!window.confirm(`Supprimer « ${spot.name} » ?`)) return;

    setBusyId(spot.id);
    try {
      await deleteSpot(spot.id, token);
      // Si on supprime le lieu en cours de modification, le formulaire repasse en mode ajout
      if (editingSpot?.id === spot.id) setEditingSpot(null);
      await reload();
    } catch (err) {
      handleApiError(err);
    } finally {
      setBusyId(null); // finally : exécuté dans tous les cas, réussite ou erreur
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-6xl leading-none font-black text-mist sm:text-7xl">Control Room</h1>
        <button type="button" onClick={onLogout} className="btn btn-ghost">
          Se déconnecter
        </button>
      </header>

      {/* Un seul de ces blocs s'affiche, selon l'état du chargement */}
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

      {status === 'ready' && (
        <>
          {/* Le formulaire (id="spot-form" : c'est là que "Modifier" fait défiler la page) */}
          <section id="spot-form" className="flex flex-col gap-6 rounded-3xl border border-white/8 bg-forest/40 p-6">
            <h2 className="font-display text-4xl leading-none font-extrabold text-mist">
              {editingSpot ? `Modifier « ${editingSpot.name} »` : 'Nouveau lieu'}
            </h2>
            {/* key : quand on choisit un autre lieu à modifier, React recrée le formulaire prérempli */}
            <SpotForm
              key={editingSpot?.id ?? 'new'}
              spot={editingSpot}
              categories={categories}
              error={formError}
              onSubmit={handleSave}
              onCancel={cancelEdit}
            />
          </section>

          {/* La liste des lieux, ou un message si elle est vide */}
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-4xl leading-none font-extrabold text-mist">Lieux enregistrés</h2>
            {spots.length === 0 ? (
              <StateMessage title="Aucun lieu enregistré">Ajoute un lieu avec le formulaire ci-dessus.</StateMessage>
            ) : (
              <ul className="flex flex-col gap-3">
                {spots.map((spot) => (
                  <AdminSpotRow
                    key={spot.id}
                    spot={spot}
                    busy={busyId === spot.id}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
