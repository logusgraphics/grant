import { Router } from 'express';

import { validate } from '@/middleware/validation.middleware';
import { UsersController } from '@/rest/controllers/users.controller';
import {
  createUserRequestSchema,
  deleteUserQuerySchema,
  getUsersQuerySchema,
  updateUserRequestSchema,
  uploadUserPictureRequestSchema,
  userParamsSchema,
} from '@/rest/schemas/users.schemas';
import { TypedRequest } from '@/rest/types';
import { RequestContext } from '@/types';

export function createUserRoutes(context: RequestContext) {
  const router = Router();
  const usersController = new UsersController(context);

  /**
   * GET /api/users
   * List users with optional filtering and relations
   */
  router.get('/', validate({ query: getUsersQuerySchema }), (req, res) =>
    usersController.getUsers(req as TypedRequest<{ query: typeof getUsersQuerySchema }>, res)
  );

  /**
   * GET /api/users/:id
   * Get a single user by ID with optional relations
   */
  router.get(
    '/:id',
    validate({ params: userParamsSchema, query: getUsersQuerySchema }),
    (req, res) =>
      usersController.getUser(
        req as TypedRequest<{
          params: typeof userParamsSchema;
          query: typeof getUsersQuerySchema;
        }>,
        res
      )
  );

  /**
   * POST /api/users
   * Create a new user
   */
  router.post('/', validate({ body: createUserRequestSchema }), (req, res) =>
    usersController.createUser(req as TypedRequest<{ body: typeof createUserRequestSchema }>, res)
  );

  /**
   * PATCH /api/users/:id
   * Update an existing user
   */
  router.patch(
    '/:id',
    validate({ params: userParamsSchema, body: updateUserRequestSchema }),
    (req, res) =>
      usersController.updateUser(
        req as TypedRequest<{
          body: typeof updateUserRequestSchema;
          params: typeof userParamsSchema;
        }>,
        res
      )
  );

  /**
   * DELETE /api/users/:id
   * Delete a user
   */
  router.delete(
    '/:id',
    validate({ params: userParamsSchema, query: deleteUserQuerySchema }),
    (req, res) =>
      usersController.deleteUser(
        req as TypedRequest<{
          params: typeof userParamsSchema;
          query: typeof deleteUserQuerySchema;
        }>,
        res
      )
  );

  /**
   * POST /api/users/:id/picture
   * Upload a user profile picture
   */
  router.post(
    '/:id/picture',
    validate({ params: userParamsSchema, body: uploadUserPictureRequestSchema }),
    (req, res) =>
      usersController.uploadPicture(
        req as TypedRequest<{
          params: typeof userParamsSchema;
          body: typeof uploadUserPictureRequestSchema;
        }>,
        res
      )
  );

  return router;
}
