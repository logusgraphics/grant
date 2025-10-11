import { Router } from 'express';

import { RoleController } from '@/rest/controllers/role.controller';
import { authMiddleware, requireAuth } from '@/middleware/auth.middleware';

export function createRoleRoutes(context: any) {
  const router = Router();
  const roleController = new RoleController(context);

  router.get('/', authMiddleware, (req, res) => roleController.getRoles(req, res));

  router.get('/:id', authMiddleware, (req, res) => roleController.getRole(req, res));

  router.post('/', authMiddleware, requireAuth, (req, res) => roleController.createRole(req, res));

  router.put('/:id', authMiddleware, requireAuth, (req, res) =>
    roleController.updateRole(req, res)
  );

  router.delete('/:id', authMiddleware, requireAuth, (req, res) =>
    roleController.deleteRole(req, res)
  );

  router.get('/:id/groups', authMiddleware, (req, res) => roleController.getRoleGroups(req, res));

  router.post('/:id/groups', authMiddleware, requireAuth, (req, res) =>
    roleController.addRoleGroup(req, res)
  );

  router.delete('/:id/groups/:groupId', authMiddleware, requireAuth, (req, res) =>
    roleController.removeRoleGroup(req, res)
  );

  router.get('/:id/tags', authMiddleware, (req, res) => roleController.getRoleTags(req, res));

  router.post('/:id/tags', authMiddleware, requireAuth, (req, res) =>
    roleController.addRoleTag(req, res)
  );

  router.delete('/:id/tags/:tagId', authMiddleware, requireAuth, (req, res) =>
    roleController.removeRoleTag(req, res)
  );

  return router;
}

export const roleRoutes = Router();
