// Configuration d'Express, séparée de index.ts pour que les tests
// (Supertest) puissent utiliser l'application sans démarrer le serveur.
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import apiRoutes from './routes/index.js';
import { env } from './config/env.js';

const app = express();

app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json());

app.use('/api', apiRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
