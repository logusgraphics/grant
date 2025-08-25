import { z } from 'zod';

import { idSchema, scopeSchema } from '../common/schemas';

export const queryUserRolesArgsSchema = z.object({
  scope: scopeSchema,
  userId: idSchema,
});

export const addUserRoleInputSchema = z.object({
  roleId: idSchema.refine((roleId) => roleId.trim().length > 0, 'Role ID is required'),
  userId: idSchema.refine((userId) => userId.trim().length > 0, 'User ID is required'),
});

export const removeUserRoleInputSchema = z.object({
  roleId: idSchema.refine((roleId) => roleId.trim().length > 0, 'Role ID is required'),
  userId: idSchema.refine((userId) => userId.trim().length > 0, 'User ID is required'),
});

export const addUserRoleArgsSchema = z.object({
  input: addUserRoleInputSchema,
});

export const removeUserRoleArgsSchema = z.object({
  input: removeUserRoleInputSchema,
});

export const userRoleSchema = z.object({
  id: idSchema,
  userId: idSchema,
  roleId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
  user: z.any().nullable().optional(),
  role: z.any().nullable().optional(),
});

export const getUserRolesParamsSchema = queryUserRolesArgsSchema.omit({ scope: true });
export const addUserRoleParamsSchema = addUserRoleArgsSchema;
export const removeUserRoleParamsSchema = removeUserRoleArgsSchema;
