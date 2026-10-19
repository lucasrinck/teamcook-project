// Routes de l'application (react-router) :
//   /       -> page Explorer (client)
//   /admin  -> page Control Room (administrateur)
// Sur Netlify, le fichier public/_redirects renvoie toutes les URL vers
// index.html pour que /admin fonctionne aussi après un rechargement.
import { BrowserRouter, Route, Routes } from 'react-router';
import { ToastProvider } from './hooks/useToast';
import AdminPage from './pages/AdminPage';
import ExplorerPage from './pages/ExplorerPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<ExplorerPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
