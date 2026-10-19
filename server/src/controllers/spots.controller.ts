// Contrôleurs : reçoivent la requête HTTP, valident les données,
// appellent le service (base de données) et choisissent le code HTTP.
// Les erreurs lancées (throw) sont envoyées automatiquement par Express 5
// au middleware errorHandler.
import type { Request, Response } from 'express';
import * as spotsService from '../services/spots.service.js';
import { spotBodySchema, parseId } from '../validators/spot.validator.js';
import { HttpError } from '../middleware/httpError.js';

// GET /api/spots -> 200 + liste des lieux
export async function getSpots(req: Request, res: Response) {
  const spots = await spotsService.listSpots();
  res.status(200).json(spots);
}

// POST /api/spots -> 201 + lieu créé
export async function createSpot(req: Request, res: Response) {
  // parse() lance une ZodError si le corps est invalide -> HTTP 400
  const input = spotBodySchema.parse(req.body);
  const spot = await spotsService.createSpot(input);
  res.status(201).json(spot);
}

// PUT /api/spots/:id -> 200 + lieu modifié, 404 s'il n'existe pas
export async function updateSpot(req: Request<{ id: string }>, res: Response) {
  const id = parseId(req.params.id);
  const input = spotBodySchema.parse(req.body);

  const spot = await spotsService.replaceSpot(id, input);
  if (!spot) throw new HttpError(404, 'Lieu introuvable');

  res.status(200).json(spot);
}

// DELETE /api/spots/:id -> 204 sans corps, 404 s'il n'existe pas
export async function deleteSpot(req: Request<{ id: string }>, res: Response) {
  const id = parseId(req.params.id);

  const deleted = await spotsService.deleteSpot(id);
  if (!deleted) throw new HttpError(404, 'Lieu introuvable');

  res.status(204).end();
}
