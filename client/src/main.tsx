// Point d'entrée du site React : c'est le premier fichier exécuté dans le navigateur.
// StrictMode : mode de React qui signale les erreurs courantes pendant le développement
import { StrictMode } from 'react';
// createRoot : la fonction qui "branche" React sur la page HTML
import { createRoot } from 'react-dom/client';
// App : le composant principal, qui contient toutes les pages
import App from './App';
// Les styles globaux du site (Tailwind + nos couleurs)
import './styles/index.css';

// document.getElementById('root') trouve la <div id="root"> du fichier index.html.
// Le "!" dit à TypeScript : "cet élément existe forcément".
// render() affiche le composant App à l'intérieur de cette div.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
