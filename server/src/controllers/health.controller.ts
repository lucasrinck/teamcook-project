import type { Request, Response } from 'express';

// GET /api/health : répond simplement "ok" pour montrer que l'API fonctionne.
// Utile pour tester rapidement le serveur, ou pour le réveiller sur Render avant une démo.
export function getHealth(req: Request, res: Response) {
  // res.json() envoie un objet au format JSON (code 200 par défaut).
  // new Date().toISOString() donne la date et l'heure actuelles, ex. "2026-10-25T14:55:01.786Z"
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
}
