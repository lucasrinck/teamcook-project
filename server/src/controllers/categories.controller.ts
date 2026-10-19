import type { Request, Response } from 'express';
import { listCategories } from '../services/categories.service.js';

// GET /api/categories -> 200 + liste des catégories (filtres et formulaire admin)
export async function getCategories(req: Request, res: Response) {
  const categories = await listCategories();
  res.status(200).json(categories);
}
