import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Le client appelle l'API via VITE_API_URL (voir .env.example) :
// pas de proxy, pour que le comportement en local soit le même qu'en production.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
});
