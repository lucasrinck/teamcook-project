// Toutes les routes de l'API, sous le préfixe /api (voir app.ts).
// Une route = une adresse + une méthode HTTP (GET, POST...) + la fonction qui répond.

// Router : un "mini-serveur" Express dans lequel on range des routes
import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';
import { getCategories } from '../controllers/categories.controller.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
// Les routes des lieux sont rangées dans un fichier à part
import spotsRoutes from './spots.routes.js';

const router = Router();

// GET /api/health : l'API est-elle en ligne ? (pratique pour réveiller Render)
router.get('/health', getHealth);
// GET /api/categories : la liste des catégories
router.get('/categories', getCategories);
// Toutes les adresses qui commencent par /api/spots sont gérées par spots.routes.ts
router.use('/spots', spotsRoutes);

// GET /api/admin/verify : vérifie le token saisi sur la page /admin, sans rien modifier.
// requireAdmin vérifie le token ; s'il est bon, la petite fonction répond 204 (OK, sans contenu).
// S'il est mauvais, requireAdmin a déjà répondu 401.
router.get('/admin/verify', requireAdmin, (req, res) => {
  res.status(204).end();
});

// On exporte le router pour que app.ts le branche sur /api
export default router;
