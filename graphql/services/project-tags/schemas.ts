import { z } from 'zod';

import { idSchema } from '../common/schemas';

export const projectTagSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  tagId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const getProjectTagsParamsSchema = z.object({
  projectId: idSchema,
});

export const addProjectTagInputSchema = z.object({
  projectId: idSchema,
  tagId: idSchema,
});

export const addProjectTagParamsSchema = z.object({
  input: addProjectTagInputSchema,
});

export const removeProjectTagInputSchema = z.object({
  projectId: idSchema,
  tagId: idSchema,
});

export const removeProjectTagParamsSchema = z.object({
  input: removeProjectTagInputSchema,
});
