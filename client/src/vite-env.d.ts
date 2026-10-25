// Types des variables d'environnement du frontend.
// Seules les variables préfixées VITE_ sont exposées au navigateur :
// elles finissent dans le bundle public, donc jamais de secret ici.
// Ce fichier sert uniquement à TypeScript : il sait ainsi que import.meta.env.VITE_API_URL existe.
interface ImportMetaEnv {
  readonly VITE_API_URL: string; // adresse de l'API Express, ex. http://localhost:3000/api
  readonly VITE_CARTO_KEY: string; // clé publique du fond de carte, pas un secret
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
