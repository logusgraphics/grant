import { z } from 'zod';

import { idSchema } from '../common/schemas';

export const projectPermissionSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  permissionId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const getProjectPermissionsParamsSchema = z.object({
  projectId: idSchema,
});

export const addProjectPermissionInputSchema = z.object({
  projectId: idSchema,
  permissionId: idSchema,
});

export const addProjectPermissionParamsSchema = z.object({
  input: addProjectPermissionInputSchema,
});

export const removeProjectPermissionInputSchema = z.object({
  projectId: idSchema,
  permissionId: idSchema,
});

export const removeProjectPermissionParamsSchema = z.object({
  input: removeProjectPermissionInputSchema,
});
