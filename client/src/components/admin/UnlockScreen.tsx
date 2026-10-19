// Écran de déverrouillage de /admin : l'administrateur saisit le token,
// que l'API vérifie (GET /api/admin/verify) avant d'ouvrir la Control Room.
import { useState, type FormEvent } from 'react';
import { ApiError, verifyAdminToken } from '../../services/api';
import { Icon } from '../Icon';

export function UnlockScreen({ onUnlock }: { onUnlock: (token: string) => void }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const value = token.trim();
    if (!value) {
      setError('Saisis le token administrateur.');
      return;
    }

    setChecking(true);
    setError('');
    try {
      await verifyAdminToken(value);
      onUnlock(value);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Token refusé. Vérifie le token administrateur défini dans le fichier .env du serveur.');
      } else {
        setError(err instanceof Error ? err.message : 'Vérification impossible.');
      }
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70svh] max-w-md flex-col justify-center px-4 py-16">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 rounded-[2rem] border border-white/8 bg-forest/50 p-8">
        <span className="grid size-12 place-items-center rounded-2xl bg-acid/10 text-acid">
          <Icon name="lock" className="size-6" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-5xl leading-none font-extrabold text-mist">Control Room</h1>
          <p className="text-ash">Saisis le token administrateur pour gérer les lieux.</p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="admin-token" className="field-label">
            Token administrateur
          </label>
          <input
            id="admin-token"
            type="password"
            autoComplete="off"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'admin-token-error' : 'admin-token-help'}
            className="field-input"
          />
          {error ? (
            <p id="admin-token-error" role="alert" className="field-error">
              {error}
            </p>
          ) : (
            <p id="admin-token-help" className="text-sm text-ash">
              Il reste dans cet onglet uniquement et s'efface à sa fermeture.
            </p>
          )}
        </div>

        <button type="submit" disabled={checking} className="btn btn-primary">
          {checking ? 'Vérification…' : 'Déverrouiller'}
        </button>
      </form>
    </div>
  );
}
