import { Link } from 'react-router';
import { Navbar } from '../components/Layout';
import { StateMessage } from '../components/StateMessage';

export default function NotFoundPage() {
  return (
    <>
      <Navbar />
      <main className="px-4 py-24">
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
