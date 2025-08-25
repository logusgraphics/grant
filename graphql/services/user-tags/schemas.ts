import { z } from 'zod';

import { idSchema, scopeSchema } from '../common/schemas';

export const queryUserTagsArgsSchema = z.object({
  scope: scopeSchema,
  userId: idSchema,
});

export const addUserTagInputSchema = z.object({
  tagId: idSchema.refine((tagId) => tagId.trim().length > 0, 'Tag ID is required'),
  userId: idSchema.refine((userId) => userId.trim().length > 0, 'User ID is required'),
});

export const removeUserTagInputSchema = z.object({
  tagId: idSchema.refine((tagId) => tagId.trim().length > 0, 'Tag ID is required'),
  userId: idSchema.refine((userId) => userId.trim().length > 0, 'User ID is required'),
});

export const addUserTagArgsSchema = z.object({
  input: addUserTagInputSchema,
});

export const removeUserTagArgsSchema = z.object({
  input: removeUserTagInputSchema,
});

export const userTagSchema = z.object({
  id: idSchema,
  userId: idSchema,
  tagId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
  user: z.any().nullable().optional(),
  tag: z.any().nullable().optional(),
});

export const getUserTagsParamsSchema = queryUserTagsArgsSchema.omit({ scope: true });
export const addUserTagParamsSchema = addUserTagArgsSchema;
export const removeUserTagParamsSchema = removeUserTagArgsSchema;
