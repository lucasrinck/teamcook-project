// Protège les routes d'écriture (POST, PUT, PATCH, DELETE).
// Le client doit envoyer le header  x-admin-token: <ADMIN_TOKEN>
import { createHash, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';

// On compare les empreintes SHA-256 des deux tokens plutôt que les tokens :
// - timingSafeEqual exige deux valeurs de même longueur (une empreinte fait toujours 32 octets) ;
// - la comparaison prend toujours le même temps, donc impossible de deviner
//   le token caractère par caractère en mesurant le temps de réponse.
function sha256(value: string) {
  return createHash('sha256').update(value).digest();
}

const expectedToken = sha256(env.ADMIN_TOKEN);

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.get('x-admin-token');

  if (!token || !timingSafeEqual(sha256(token), expectedToken)) {
    res.status(401).json({ error: 'Accès refusé : token administrateur manquant ou invalide' });
    return;
  }

  next();
}
