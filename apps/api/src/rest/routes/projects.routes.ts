import { Router } from 'express';

import { authMiddleware, requireAuth } from '@/middleware/auth.middleware';

export function createProjectRoutes(context: any) {
  const router = Router();

  router.get('/', authMiddleware, (req, res) => {
    res.json({ message: 'Projects endpoint - TODO: implement' });
  });

  router.get('/:id', authMiddleware, (req, res) => {
    res.json({ message: 'Get project endpoint - TODO: implement' });
  });

  router.post('/', authMiddleware, requireAuth, (req, res) => {
    res.json({ message: 'Create project endpoint - TODO: implement' });
  });

  router.put('/:id', authMiddleware, requireAuth, (req, res) => {
    res.json({ message: 'Update project endpoint - TODO: implement' });
  });

  router.delete('/:id', authMiddleware, requireAuth, (req, res) => {
    res.json({ message: 'Delete project endpoint - TODO: implement' });
  });

  return router;
}

export const projectRoutes = Router();
