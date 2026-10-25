// Routes des lieux (préfixe /api/spots).
// requireAdmin est placé AVANT la fonction de la route : sans token valide,
// la requête est refusée (401) et la base n'est jamais touchée.
import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
// Les fonctions qui font le vrai travail (appels à Supabase) sont dans le controller
import { getSpots, createSpot, updateSpot, deleteSpot } from '../controllers/spots.controller.js';

const router = Router();

// Les 4 routes du CRUD (Create, Read, Update, Delete).
// Quand plusieurs fonctions sont données, Express les appelle dans l'ordre :
// d'abord requireAdmin, puis la fonction de la route si le token est bon.
router.get('/', getSpots); //                                           lister    (200)
router.post('/', requireAdmin, createSpot); //                          ajouter   (201 / 400)
// ":id" est un paramètre : pour /api/spots/12, req.params.id vaudra "12"
router.put('/:id', requireAdmin, updateSpot); //                        modifier  (200 / 404)
router.delete('/:id', requireAdmin, deleteSpot); //                     supprimer (204)

export default router;
