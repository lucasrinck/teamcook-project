// Page 404 : affichée pour toute adresse qui ne correspond à aucune page (voir App.tsx)
import { Link } from 'react-router';
import { Navbar } from '../components/Layout';
import { StateMessage } from '../components/StateMessage';

export default function NotFoundPage() {
  return (
    <>
      <Navbar />
      <main className="px-4 py-24">
        {/* Message avec un bouton pour revenir à l'accueil */}
        <StateMessage
          title="Cette page n'existe pas"
          action={
            <Link to="/" className="btn btn-primary">
              Retour à l'exploration
            </Link>
          }
        >
          Le lien est peut-être incorrect.
        </StateMessage>
      </main>
    </>
  );
}
