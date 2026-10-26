// Routes de l'application (react-router) :
//   /       -> page Explorer (client)
//   /admin  -> page Control Room (administrateur)
// Sur Netlify, le fichier public/_redirects renvoie toutes les URL vers
// index.html pour que /admin fonctionne aussi après un rechargement.
// (Sur Vercel, c'est le fichier vercel.json qui fait la même chose.)

// BrowserRouter : active la navigation par URL ; Routes/Route : associent une adresse à une page
import { BrowserRouter, Route, Routes } from 'react-router';
import AdminPage from './pages/AdminPage';
import ExplorerPage from './pages/ExplorerPage';
import NotFoundPage from './pages/NotFoundPage';

// Le composant principal : il ne dessine rien lui-même, il choisit la page à afficher.
// BrowserRouter "enveloppe" les routes : chaque page a donc accès à la navigation par URL.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Une Route par page : path = l'adresse, element = le composant à afficher */}
        <Route path="/" element={<ExplorerPage />} />
        <Route path="/admin" element={<AdminPage />} />
        {/* "*" = n'importe quelle autre adresse : page 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
