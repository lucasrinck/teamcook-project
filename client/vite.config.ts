// Configuration de Vite, l'outil qui lance le site en développement (npm run dev)
// et qui fabrique la version finale du site (npm run build -> dossier dist/).
import { defineConfig } from 'vite';
// Plugin qui permet à Vite de comprendre React (JSX, rechargement instantané...)
import react from '@vitejs/plugin-react';
// Plugin qui génère les classes Tailwind CSS utilisées dans le code
import tailwindcss from '@tailwindcss/vite';

// Le client appelle l'API via VITE_API_URL (voir .env.example) :
// pas de proxy, pour que le comportement en local soit le même qu'en production.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // le site de développement s'ouvre sur http://localhost:5173
  },
});
