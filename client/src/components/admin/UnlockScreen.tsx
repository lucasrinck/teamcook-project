// Écran de déverrouillage de /admin : l'administrateur saisit le token,
// que l'API vérifie (GET /api/admin/verify) avant d'ouvrir la Control Room.
import { useState, type FormEvent } from 'react';
import { ApiError, verifyAdminToken } from '../../services/api';
import { Icon } from '../Icon';

// onUnlock : fonction appelée avec le token quand il est accepté (AdminPage l'enregistre)
export function UnlockScreen({ onUnlock }: { onUnlock: (token: string) => void }) {
  const [token, setToken] = useState(''); // ce que l'utilisateur tape dans le champ
  const [error, setError] = useState(''); // message d'erreur à afficher sous le champ
  const [checking, setChecking] = useState(false); // true pendant la vérification par l'API

  // Appelée quand on valide le formulaire (bouton ou touche Entrée)
  async function handleSubmit(event: FormEvent) {
    // Empêche le navigateur de recharger la page (comportement normal d'un formulaire)
    event.preventDefault();
    const value = token.trim(); // on enlève les espaces au début et à la fin
    if (!value) {
      setError('Saisis le token administrateur.');
      return;
    }

    setChecking(true);
    setError('');
    try {
      // On demande à l'API si le token est bon. S'il est mauvais, une erreur est lancée.
      await verifyAdminToken(value);
      onUnlock(value); // token accepté : on ouvre la Control Room
    } catch (err) {
      // 401 : le serveur a refusé le token
      if (err instanceof ApiError && err.status === 401) {
        setError('Token refusé. Vérifie le token administrateur défini dans le fichier .env du serveur.');
      } else {
        // Autre problème (API éteinte, réseau...) : on affiche le message reçu
        setError(err instanceof Error ? err.message : 'Vérification impossible.');
      }
    } finally {
      // "finally" s'exécute dans tous les cas, réussite ou erreur
      setChecking(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70svh] max-w-md flex-col justify-center px-4 py-16">
      {/* noValidate : on gère nous-mêmes les messages d'erreur, pas le navigateur */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 rounded-[2rem] border border-white/8 bg-forest/50 p-8">
        <span className="grid size-12 place-items-center rounded-2xl bg-acid/10 text-acid">
          <Icon name="lock" className="size-6" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-5xl leading-none font-extrabold text-mist">Control Room</h1>
          <p className="text-ash">Saisis le token administrateur pour gérer les lieux.</p>
        </div>

        <div className="flex flex-col gap-2">
          {/* htmlFor relie le libellé au champ : cliquer sur le texte place le curseur dans le champ */}
          <label htmlFor="admin-token" className="field-label">
            Token administrateur
          </label>
          <input
            id="admin-token"
            type="password" // les caractères sont masqués
            autoComplete="off"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'admin-token-error' : 'admin-token-help'}
            className="field-input"
          />
          {/* On affiche soit le message d'erreur, soit une aide */}
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

        {/* Bouton désactivé pendant la vérification, pour éviter les doubles clics */}
        <button type="submit" disabled={checking} className="btn btn-primary">
          {checking ? 'Vérification…' : 'Déverrouiller'}
        </button>
      </form>
    </div>
  );
}
