// Point d'entrée du serveur : charge le .env puis démarre Express.
// (La validation complète des variables d'environnement arrive à l'étape 4.)
import 'dotenv/config';
import app from './app.js';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`AFTERDARK API running on http://localhost:${PORT}/api`);
});
