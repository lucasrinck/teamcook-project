import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';
import spotsRoutes from './spots.routes.js';

const router = Router();

router.get('/health', getHealth);
router.use('/spots', spotsRoutes);

export default router;
