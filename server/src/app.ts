// Configuration d'Express, séparée de index.ts pour que les tests
// (Supertest) puissent utiliser l'application sans démarrer le serveur.
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

app.disable('x-powered-by'); // ne pas annoncer "Express" dans les réponses

// CORS : seul le frontend (CLIENT_URL) a le droit d'appeler l'API depuis un navigateur
app.use(cors({ origin: env.CLIENT_URL }));

// Lit le corps JSON des requêtes (limite de taille pour éviter les abus)
app.use(express.json({ limit: '100kb' }));

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler); // toujours en dernier

export default app;
