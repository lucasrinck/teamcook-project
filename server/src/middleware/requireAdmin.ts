// Protège les routes d'écriture (POST, PUT, DELETE).
// Le front doit envoyer le header  x-admin-token: <ADMIN_TOKEN>
// Un "header" est une information envoyée avec la requête, en plus de l'adresse et du corps.
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';

// Middleware : Express l'appelle AVANT la fonction de la route (voir routes/spots.routes.ts).
// - req  : la requête reçue
// - res  : la réponse qu'on peut renvoyer
// - next : la fonction à appeler pour laisser passer la requête vers la route
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // req.get('x-admin-token') lit le header envoyé par le front.
  // S'il est absent ou différent du token du fichier .env, on refuse.
  if (req.get('x-admin-token') !== env.ADMIN_TOKEN) {
    // 401 = "non autorisé". La route n'est jamais exécutée, la base n'est pas touchée.
    res.status(401).json({ error: 'Accès refusé : token administrateur manquant ou invalide' });
    return;
  }
  next(); // token correct : on passe à la route
}
