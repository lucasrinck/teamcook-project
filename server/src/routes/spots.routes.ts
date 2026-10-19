// Routes des lieux (préfixe /api/spots, voir routes/index.ts).
// requireAdmin est placé AVANT le contrôleur : sans token valide,
// la requête est refusée (401) avant même de lire les données.
import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  getSpots,
  getSpot,
  createSpot,
  updateSpot,
  updateAvailability,
  deleteSpot,
} from '../controllers/spots.controller.js';

const router = Router();

// Les quatre routes CRUD principales
router.get('/', getSpots); //                       READ   (public)
router.post('/', requireAdmin, createSpot); //      CREATE (admin)
router.put('/:id', requireAdmin, updateSpot); //    UPDATE (admin)
router.delete('/:id', requireAdmin, deleteSpot); // DELETE (admin)

// Routes complémentaires
router.get('/:id', getSpot); //                                         READ un lieu (public)
router.patch('/:id/availability', requireAdmin, updateAvailability); // disponibilité (admin)

export default router;
