import { z } from 'zod';

import { deleteSchema, idSchema } from './common/schemas';

export const projectAppTagSchema = z.object({
  id: idSchema,
  projectAppId: idSchema,
  tagId: idSchema,
  isPrimary: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const getProjectAppTagsParamsSchema = z.object({
  projectAppId: idSchema,
});

export const addProjectAppTagInputSchema = z.object({
  projectAppId: idSchema,
  tagId: idSchema,
  isPrimary: z.boolean().nullable().optional(),
});

export const updateProjectAppTagInputSchema = z.object({
  projectAppId: idSchema,
  tagId: idSchema,
  isPrimary: z.boolean(),
});

export const removeProjectAppTagInputSchema = deleteSchema.extend({
  projectAppId: idSchema,
  tagId: idSchema,
});

export const getProjectAppTagIntersectionInputSchema = z.object({
  projectAppIds: z.array(idSchema),
  tagIds: z.array(idSchema),
});
