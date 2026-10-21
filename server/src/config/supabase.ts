// Client Supabase unique pour tout le serveur.
// Il utilise la clé SECRÈTE : elle contourne RLS, c'est pourquoi elle ne doit
// exister que côté serveur et que toute la validation se fait dans Express.
import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  // Pas de session utilisateur à conserver : le serveur n'est pas un navigateur.
  auth: { persistSession: false },
});
