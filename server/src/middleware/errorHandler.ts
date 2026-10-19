// Middleware de gestion des erreurs CENTRALISÉ.
// Toutes les erreurs de l'API arrivent ici (Express 5 transmet aussi les
// erreurs des fonctions async) et repartent avec le même format JSON :
//   { "error": "...", "details": [{ "field": "...", "message": "..." }] }
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from './httpError.js';
import { formatZodError } from '../validators/formatZodError.js';

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  // 1. Données invalides détectées par Zod -> 400
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', details: formatZodError(err) });
    return;
  }

  // 2. Erreurs prévues par notre code (404, 400 de la base...)
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, details: err.details });
    return;
  }

  // 3. Corps de requête qui n'est pas du JSON valide (erreur levée par express.json)
  if (err instanceof SyntaxError && 'type' in err && err.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Le corps de la requête doit être du JSON valide' });
    return;
  }

  // 4. Tout le reste : erreur inattendue. On la journalise côté serveur
  //    mais on ne renvoie aucun détail technique au client.
  console.error(err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
}

// Route inconnue -> 404
export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: 'Route introuvable' });
}
