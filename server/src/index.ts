// Point d'entrée du serveur : valide le .env puis démarre Express.
import { env } from './config/env.js';
import app from './app.js';

app.listen(env.PORT, () => {
  console.log(`AFTERDARK API running on http://localhost:${env.PORT}/api`);
});
