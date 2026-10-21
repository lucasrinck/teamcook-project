// Toutes les routes de l'API, sous le préfixe /api (voir app.ts).
import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';
import { getCategories } from '../controllers/categories.controller.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import spotsRoutes from './spots.routes.js';

const router = Router();

router.get('/health', getHealth); // l'API est-elle en ligne ?
router.get('/categories', getCategories);
router.use('/spots', spotsRoutes);

// Vérifie le token saisi sur la page /admin, sans rien modifier (204 = bon token, 401 = refusé)
router.get('/admin/verify', requireAdmin, (req, res) => {
  res.status(204).end();
});

export default router;
