// Charge le fichier .env et vérifie qu'aucune variable ne manque.
// S'il en manque une, le serveur s'arrête tout de suite avec un message clair.

// Cette ligne lit le fichier server/.env et range chaque variable dans process.env
import 'dotenv/config';

// La liste des variables obligatoires pour que le serveur fonctionne
const REQUIRED = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'CLIENT_URL', 'ADMIN_TOKEN'];

// On passe en revue chaque nom de variable
for (const name of REQUIRED) {
  // process.env[name] vaut undefined (ou "") si la variable n'est pas remplie
  if (!process.env[name]) {
    // On affiche le NOM de la variable manquante, jamais sa valeur (elle peut être secrète)
    console.error(`Variable manquante dans server/.env : ${name}`);
    // process.exit(1) arrête le programme ; 1 signifie "arrêt à cause d'une erreur"
    process.exit(1);
  }
}

// Un objet qui regroupe toutes les variables, pour les utiliser facilement ailleurs (env.PORT...)
export const env = {
  // Number() transforme le texte "3000" en nombre ; si PORT est vide, on prend 3000 par défaut
  PORT: Number(process.env.PORT) || 3000,
  // "as string" dit à TypeScript : "c'est forcément du texte" (on l'a vérifié juste au-dessus)
  SUPABASE_URL: process.env.SUPABASE_URL as string,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY as string,
  CLIENT_URL: process.env.CLIENT_URL as string,
  ADMIN_TOKEN: process.env.ADMIN_TOKEN as string,
};
