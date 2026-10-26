// Page administrateur "/admin".
// Sans token : écran de déverrouillage. Avec token : la Control Room.
// Rappel : masquer cette page n'est PAS une protection ; la vraie protection
// est le middleware requireAdmin côté serveur.
import { ControlRoom } from '../components/admin/ControlRoom';
import { UnlockScreen } from '../components/admin/UnlockScreen';
import { Navbar } from '../components/Layout';
import { useAdminToken } from '../hooks/useAdminToken';

export default function AdminPage() {
  // Le token enregistré dans l'onglet, et les fonctions pour l'enregistrer ou l'effacer
  const { token, saveToken, clearToken } = useAdminToken();

  return (
    // <> ... </> est un "fragment" : il regroupe plusieurs éléments sans ajouter de balise
    <>
      <Navbar />
      {/* Si on a un token : la Control Room ; sinon : l'écran de déverrouillage */}
      <main>{token ? <ControlRoom token={token} onLogout={clearToken} /> : <UnlockScreen onUnlock={saveToken} />}</main>
    </>
  );
}
