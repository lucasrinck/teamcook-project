// Client Supabase unique pour tout le serveur.
// Il utilise la clé SECRÈTE : elle contourne RLS, c'est pourquoi elle ne doit
// exister que côté serveur et que toute la validation se fait dans Express.

// createClient : la fonction de la bibliothèque Supabase qui crée la connexion à la base
import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// On crée la connexion une seule fois, puis on l'importe partout où on en a besoin
// (dans les controllers). Elle prend l'adresse du projet Supabase et la clé secrète.
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  // Pas de session utilisateur à conserver : le serveur n'est pas un navigateur.
  auth: { persistSession: false },
});
