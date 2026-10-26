// Configuration d'Express : middlewares, routes et gestion des erreurs.
// Un "middleware" est une fonction qui reçoit chaque requête avant (ou après) les routes.
// Express les exécute dans l'ordre où on les déclare avec app.use().

// express : la bibliothèque qui crée le serveur web.
// NextFunction, Request, Response : uniquement des types TypeScript (pour l'aide à l'écriture).
import express, { type NextFunction, type Request, type Response } from 'express';
// cors : gère l'autorisation des appels venant d'un autre site (notre front React)
import cors from 'cors';
import { env } from './config/env.js';
// apiRoutes : toutes nos routes (/health, /categories, /spots...), déclarées dans routes/index.ts
import apiRoutes from './routes/index.js';

// On crée l'application Express
const app = express();

// CORS : seul notre site (CLIENT_URL) a le droit d'appeler l'API depuis un navigateur.
// Sans cette ligne, le navigateur bloquerait les requêtes du front vers l'API.
app.use(cors({ origin: env.CLIENT_URL }));

// Lit le corps JSON des requêtes (req.body).
// Sans ça, req.body serait vide quand le front envoie un formulaire en JSON.
app.use(express.json());

// Toutes nos routes commencent par /api (ex. /api/spots, /api/categories)
app.use('/api', apiRoutes);

// Route inconnue -> 404.
// Ce middleware est placé après les routes : on n'y arrive que si aucune route n'a répondu.
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route introuvable' });
});

// Gestion des erreurs inattendues.
// Express reconnaît un middleware d'erreur à ses 4 paramètres (err, req, res, next).
// - 400 si le JSON envoyé est mal formé (erreur levée par express.json())
// - 500 pour toute autre erreur
app.use((err: { type?: string }, req: Request, res: Response, next: NextFunction) => {
  if (err.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Le corps de la requête doit être du JSON valide' });
    return; // on arrête la fonction ici
  }
  // On affiche le détail dans le terminal du serveur, mais pas au visiteur
  console.error(err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// On exporte l'application pour que index.ts puisse la démarrer
export default app;
