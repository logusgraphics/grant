import { z } from 'zod';

import { idSchema, scopeSchema } from '../common/schemas';

export const queryRoleGroupsArgsSchema = z.object({
  scope: scopeSchema,
  roleId: idSchema,
});

export const addRoleGroupInputSchema = z.object({
  roleId: idSchema.refine((roleId) => roleId.trim().length > 0, 'Role ID is required'),
  groupId: idSchema.refine((groupId) => groupId.trim().length > 0, 'Group ID is required'),
});

export const removeRoleGroupInputSchema = z.object({
  roleId: idSchema.refine((roleId) => roleId.trim().length > 0, 'Role ID is required'),
  groupId: idSchema.refine((groupId) => groupId.trim().length > 0, 'Group ID is required'),
});

export const addRoleGroupArgsSchema = z.object({
  input: addRoleGroupInputSchema,
});

export const removeRoleGroupArgsSchema = z.object({
  input: removeRoleGroupInputSchema,
});

export const roleGroupSchema = z.object({
  id: idSchema,
  roleId: idSchema,
  groupId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
  role: z.any().nullable().optional(),
  group: z.any().nullable().optional(),
});

export const getRoleGroupsParamsSchema = queryRoleGroupsArgsSchema.omit({ scope: true });
export const addRoleGroupParamsSchema = addRoleGroupArgsSchema;
export const removeRoleGroupParamsSchema = removeRoleGroupArgsSchema;
