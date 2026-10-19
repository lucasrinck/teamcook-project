// Protège les routes d'écriture (POST, PUT, PATCH, DELETE).
// Le front doit envoyer le header  x-admin-token: <ADMIN_TOKEN>
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.get('x-admin-token') !== env.ADMIN_TOKEN) {
    res.status(401).json({ error: 'Accès refusé : token administrateur manquant ou invalide' });
    return;
  }
  next(); // token correct : on passe à la route
}
