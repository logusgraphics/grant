import { z } from 'zod';

import { idSchema } from '../common/schemas';

export const permissionTagSchema = z.object({
  id: idSchema,
  permissionId: idSchema,
  tagId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const getPermissionTagsParamsSchema = z.object({
  permissionId: idSchema,
});

export const addPermissionTagInputSchema = z.object({
  permissionId: idSchema,
  tagId: idSchema,
});

export const addPermissionTagParamsSchema = z.object({
  input: addPermissionTagInputSchema,
});

export const removePermissionTagInputSchema = z.object({
  permissionId: idSchema,
  tagId: idSchema,
});

export const removePermissionTagParamsSchema = z.object({
  input: removePermissionTagInputSchema,
});
