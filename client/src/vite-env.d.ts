// Types des variables d'environnement du frontend.
// Seules les variables préfixées VITE_ sont exposées au navigateur :
// elles finissent dans le bundle public, donc jamais de secret ici.
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
