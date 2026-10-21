// Configuration d'Express : middlewares, routes et gestion des erreurs.
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';

const app = express();

// CORS : seul notre site (CLIENT_URL) a le droit d'appeler l'API depuis un navigateur
app.use(cors({ origin: env.CLIENT_URL }));

// Lit le corps JSON des requêtes (req.body)
app.use(express.json());

app.use('/api', apiRoutes);

// Route inconnue -> 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route introuvable' });
});

// Erreur inattendue -> 400 si le JSON envoyé est mal formé, sinon 500
app.use((err: { type?: string }, req: Request, res: Response, next: NextFunction) => {
  if (err.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Le corps de la requête doit être du JSON valide' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

export default app;
