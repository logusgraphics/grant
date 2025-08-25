import { z } from 'zod';

import { idSchema } from '../common/schemas';

export const getProjectUsersParamsSchema = z.object({
  projectId: idSchema,
});

export const addProjectUserParamsSchema = z.object({
  input: z.object({
    projectId: idSchema,
    userId: idSchema,
  }),
});

export const removeProjectUserParamsSchema = z.object({
  input: z.object({
    projectId: idSchema,
    userId: idSchema,
  }),
});

export const projectUserSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  userId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});
