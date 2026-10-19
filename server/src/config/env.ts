// Chargement et validation des variables d'environnement.
// Si une variable manque ou est invalide, le serveur refuse de démarrer :
// on préfère une erreur claire au lancement plutôt qu'un bug plus tard.
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  SUPABASE_URL: z.url('SUPABASE_URL doit être une URL (https://xxxx.supabase.co)'),
  SUPABASE_SECRET_KEY: z.string('SUPABASE_SECRET_KEY est obligatoire').min(1, 'SUPABASE_SECRET_KEY est obligatoire'),
  CLIENT_URL: z.url('CLIENT_URL doit être une URL (ex. http://localhost:5173)'),
  ADMIN_TOKEN: z.string('ADMIN_TOKEN est obligatoire').min(16, 'ADMIN_TOKEN doit contenir au moins 16 caractères'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  // On affiche le nom de la variable et le problème, jamais sa valeur.
  console.error('Configuration invalide dans server/.env :');
  for (const issue of result.error.issues) {
    console.error(`  - ${issue.path.join('.')} : ${issue.message}`);
  }
  process.exit(1);
}

export const env = result.data;
