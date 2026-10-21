// Types des variables d'environnement du frontend.
// Seules les variables préfixées VITE_ sont exposées au navigateur :
// elles finissent dans le bundle public, donc jamais de secret ici.
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CARTO_KEY: string; // clé publique du fond de carte, pas un secret
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
