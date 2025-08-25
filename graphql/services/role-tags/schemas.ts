import { z } from 'zod';

import { idSchema } from '../common/schemas';

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

export const removeRoleTagInputSchema = z.object({
  roleId: idSchema,
  tagId: idSchema,
});

export const removeRoleTagParamsSchema = z.object({
  input: removeRoleTagInputSchema,
});
