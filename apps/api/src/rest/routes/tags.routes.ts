import { Router } from 'express';

import { authMiddleware, requireAuth } from '@/middleware/auth.middleware';

export function createTagRoutes(context: any) {
  const router = Router();

  router.get('/', authMiddleware, (req, res) => {
    res.json({ message: 'Tags endpoint - TODO: implement' });
  });

  router.get('/:id', authMiddleware, (req, res) => {
    res.json({ message: 'Get tag endpoint - TODO: implement' });
  });

  router.post('/', authMiddleware, requireAuth, (req, res) => {
    res.json({ message: 'Create tag endpoint - TODO: implement' });
  });

  router.put('/:id', authMiddleware, requireAuth, (req, res) => {
    res.json({ message: 'Update tag endpoint - TODO: implement' });
  });

  router.delete('/:id', authMiddleware, requireAuth, (req, res) => {
    res.json({ message: 'Delete tag endpoint - TODO: implement' });
  });

  return router;
}

export const tagRoutes = Router();
