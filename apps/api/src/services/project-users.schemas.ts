import { z } from 'zod';

import { deleteSchema, idSchema } from './common/schemas';

export const getProjectUsersParamsSchema = z.object({
  projectId: idSchema.optional(),
  userId: idSchema.optional(),
});

export const addProjectUserParamsSchema = z.object({
  projectId: idSchema,
  userId: idSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const mergeProjectUserCdmMetadataParamsSchema = z.object({
  projectId: idSchema,
  userId: idSchema,
  importerMetadata: z.record(z.string(), z.unknown()).nullish(),
});

export const updateProjectUserMetadataParamsSchema = z.object({
  projectId: idSchema,
  userId: idSchema,
  metadata: z.record(z.string(), z.unknown()),
});

export const updateProjectUserProfileParamsSchema = z
  .object({
    projectId: idSchema,
    userId: idSchema,
    displayName: z.string().max(255).nullable().optional(),
    pictureUrl: z.string().max(500).nullable().optional(),
  })
  .refine(
    (v) => v.displayName !== undefined || v.pictureUrl !== undefined,
    'At least one of displayName or pictureUrl must be provided'
  );

export const removeProjectUserParamsSchema = deleteSchema.extend({
  projectId: idSchema,
  userId: idSchema,
});

export const projectUserSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  userId: idSchema,
  metadata: z.record(z.string(), z.unknown()),
  displayName: z.string().nullable().optional(),
  pictureUrl: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});
