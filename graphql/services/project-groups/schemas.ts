import { z } from 'zod';

import { idSchema } from '../common/schemas';

export const projectGroupSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  groupId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const getProjectGroupsParamsSchema = z.object({
  projectId: idSchema,
});

export const addProjectGroupInputSchema = z.object({
  projectId: idSchema,
  groupId: idSchema,
});

export const addProjectGroupParamsSchema = z.object({
  input: addProjectGroupInputSchema,
});

export const removeProjectGroupInputSchema = z.object({
  projectId: idSchema,
  groupId: idSchema,
});

export const removeProjectGroupParamsSchema = z.object({
  input: removeProjectGroupInputSchema,
});
