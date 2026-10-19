// Routes de l'application (react-router) :
//   /       -> page Explorer (client)
//   /admin  -> page Control Room (administrateur)
// Sur Netlify, le fichier public/_redirects renvoie toutes les URL vers
// index.html pour que /admin fonctionne aussi après un rechargement.
import { BrowserRouter, Route, Routes } from 'react-router';
import { MotionConfig } from 'framer-motion';
import { ToastProvider } from './hooks/useToast';
import AdminPage from './pages/AdminPage';
import ExplorerPage from './pages/ExplorerPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    // reducedMotion="user" : Framer Motion coupe les déplacements si le système
    // demande de réduire les animations (prefers-reduced-motion)
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<ExplorerPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}
