// Charge le fichier .env et vérifie qu'aucune variable ne manque.
// S'il en manque une, le serveur s'arrête tout de suite avec un message clair.
import 'dotenv/config';

const REQUIRED = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'CLIENT_URL', 'ADMIN_TOKEN'];

for (const name of REQUIRED) {
  if (!process.env[name]) {
    console.error(`Variable manquante dans server/.env : ${name}`);
    process.exit(1);
  }
}

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  SUPABASE_URL: process.env.SUPABASE_URL as string,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY as string,
  CLIENT_URL: process.env.CLIENT_URL as string,
  ADMIN_TOKEN: process.env.ADMIN_TOKEN as string,
};
