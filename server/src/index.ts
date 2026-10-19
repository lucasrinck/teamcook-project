// Point d'entrée : démarre le serveur Express.
import { env } from './config/env.js';
import app from './app.js';

app.listen(env.PORT, () => {
  console.log(`AFTERDARK API running on http://localhost:${env.PORT}/api`);
});
