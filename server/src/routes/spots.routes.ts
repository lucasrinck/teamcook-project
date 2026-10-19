// Routes des lieux (préfixe /api/spots).
// requireAdmin est placé AVANT la fonction de la route : sans token valide,
// la requête est refusée (401) et la base n'est jamais touchée.
import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { getSpots, createSpot, updateSpot, updateAvailability, deleteSpot } from '../controllers/spots.controller.js';

const router = Router();

router.get('/', getSpots); //                                           lister    (200)
router.post('/', requireAdmin, createSpot); //                          ajouter   (201 / 400)
router.put('/:id', requireAdmin, updateSpot); //                        modifier  (200 / 404)
router.delete('/:id', requireAdmin, deleteSpot); //                     supprimer (204)
router.patch('/:id/availability', requireAdmin, updateAvailability); // bouton dispo / pas dispo

export default router;
