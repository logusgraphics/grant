import { Request, Response } from 'express';

import { BaseController } from '@/rest/controllers/base.controller';

export class RoleController extends BaseController {
  async getRoles(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, sort, search, ids, tagIds } = req.query;

      this.success(res, {
        message: 'Get roles endpoint - TODO: implement with GraphQL resolvers',
        params: { page, limit, sort, search, ids, tagIds },
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getRole(req: Request, res: Response) {
    try {
      const { id } = req.params;

      this.success(res, {
        message: 'Get role endpoint - TODO: implement with GraphQL resolvers',
        roleId: id,
      });
    } catch (error) {
      this.handleError(res, error, 404);
    }
  }

  async createRole(req: Request, res: Response) {
    try {
      const { name, description, groupIds, tagIds } = req.body;

      this.success(
        res,
        {
          message: 'Create role endpoint - TODO: implement with GraphQL resolvers',
          roleData: { name, description, groupIds, tagIds },
        },
        201
      );
    } catch (error) {
      this.handleError(res, error, 400);
    }
  }

  async updateRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      this.success(res, {
        message: 'Update role endpoint - TODO: implement with GraphQL resolvers',
        roleId: id,
        updateData: { name, description },
      });
    } catch (error) {
      this.handleError(res, error, 400);
    }
  }

  async deleteRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { hardDelete = false } = req.body;

      this.success(res, {
        message: 'Delete role endpoint - TODO: implement with GraphQL resolvers',
        roleId: id,
        hardDelete,
      });
    } catch (error) {
      this.handleError(res, error, 400);
    }
  }

  async getRoleGroups(req: Request, res: Response) {
    try {
      const { id } = req.params;

      this.success(res, {
        message: 'Get role groups endpoint - TODO: implement with GraphQL resolvers',
        roleId: id,
      });
    } catch (error) {
      this.handleError(res, error, 404);
    }
  }

  async addRoleGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { groupId } = req.body;

      this.success(
        res,
        {
          message: 'Add role group endpoint - TODO: implement with GraphQL resolvers',
          roleId: id,
          groupId,
        },
        201
      );
    } catch (error) {
      this.handleError(res, error, 400);
    }
  }

  async removeRoleGroup(req: Request, res: Response) {
    try {
      const { id, groupId } = req.params;
      const { hardDelete = false } = req.body;

      this.success(res, {
        message: 'Remove role group endpoint - TODO: implement with GraphQL resolvers',
        roleId: id,
        groupId,
        hardDelete,
      });
    } catch (error) {
      this.handleError(res, error, 400);
    }
  }

  async getRoleTags(req: Request, res: Response) {
    try {
      const { id } = req.params;

      this.success(res, {
        message: 'Get role tags endpoint - TODO: implement with GraphQL resolvers',
        roleId: id,
      });
    } catch (error) {
      this.handleError(res, error, 404);
    }
  }

  async addRoleTag(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { tagId, isPrimary = false } = req.body;

      this.success(
        res,
        {
          message: 'Add role tag endpoint - TODO: implement with GraphQL resolvers',
          roleId: id,
          tagId,
          isPrimary,
        },
        201
      );
    } catch (error) {
      this.handleError(res, error, 400);
    }
  }

  async removeRoleTag(req: Request, res: Response) {
    try {
      const { id, tagId } = req.params;
      const { hardDelete = false } = req.body;

      this.success(res, {
        message: 'Remove role tag endpoint - TODO: implement with GraphQL resolvers',
        roleId: id,
        tagId,
        hardDelete,
      });
    } catch (error) {
      this.handleError(res, error, 400);
    }
  }
}
