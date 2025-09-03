import { z } from 'zod';

import { deleteSchema, idSchema } from '../common/schemas';

export const roleTagSchema = z.object({
  id: idSchema,
  roleId: idSchema,
  tagId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const getRoleTagsParamsSchema = z.object({
  roleId: idSchema,
});

export const addRoleTagInputSchema = z.object({
  roleId: idSchema,
  tagId: idSchema,
});

export const addRoleTagParamsSchema = z.object({
  input: addRoleTagInputSchema,
});

export const removeRoleTagInputSchema = deleteSchema.extend({
  roleId: idSchema,
  tagId: idSchema,
});

export const getRoleTagIntersectionInputSchema = z.object({
  roleIds: z.array(idSchema),
  tagIds: z.array(idSchema),
});
