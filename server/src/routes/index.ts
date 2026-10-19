import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';
import spotsRoutes from './spots.routes.js';
import categoriesRoutes from './categories.routes.js';

const router = Router();

router.get('/health', getHealth);
router.use('/spots', spotsRoutes);
router.use('/categories', categoriesRoutes);

export default router;
