// Point d'entrée du serveur : c'est ce fichier que l'on lance (npm run dev ou npm start).
// Il ne fait qu'une chose : démarrer l'application Express sur un port.

// env contient les variables du fichier .env (port, clés...), déjà vérifiées dans config/env.ts
import { env } from './config/env.js';
// app est l'application Express configurée dans app.ts (middlewares + routes)
import app from './app.js';

// app.listen() démarre le serveur : il se met à "écouter" les requêtes sur le port choisi.
// La fonction passée en deuxième paramètre est appelée une fois le serveur prêt.
app.listen(env.PORT, () => {
  // Message affiché dans le terminal pour savoir que l'API tourne et à quelle adresse
  console.log(`AFTERDARK API running on http://localhost:${env.PORT}/api`);
});
