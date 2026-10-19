import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';
import spotsRoutes from './spots.routes.js';
import categoriesRoutes from './categories.routes.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/health', getHealth);
router.use('/spots', spotsRoutes);
router.use('/categories', categoriesRoutes);

// Vérifie un token admin sans rien modifier : utilisée par l'écran de
// déverrouillage de /admin. 204 = token valide, 401 = token refusé.
router.get('/admin/verify', requireAdmin, (req, res) => {
  res.status(204).end();
});

export default router;
