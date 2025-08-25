import { z } from 'zod';

import { idSchema, scopeSchema } from '../common/schemas';

export const queryOrganizationProjectsArgsSchema = z.object({
  scope: scopeSchema,
  organizationId: idSchema,
});

export const addOrganizationProjectInputSchema = z.object({
  organizationId: idSchema.refine(
    (organizationId) => organizationId.trim().length > 0,
    'Organization ID is required'
  ),
  projectId: idSchema.refine((projectId) => projectId.trim().length > 0, 'Project ID is required'),
});

export const removeOrganizationProjectInputSchema = z.object({
  organizationId: idSchema.refine(
    (organizationId) => organizationId.trim().length > 0,
    'Organization ID is required'
  ),
  projectId: idSchema.refine((projectId) => projectId.trim().length > 0, 'Project ID is required'),
});

export const addOrganizationProjectArgsSchema = z.object({
  input: addOrganizationProjectInputSchema,
});

export const removeOrganizationProjectArgsSchema = z.object({
  input: removeOrganizationProjectInputSchema,
});

export const organizationProjectSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  projectId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
  organization: z.any().nullable().optional(),
  project: z.any().nullable().optional(),
});

export const getOrganizationProjectsParamsSchema = queryOrganizationProjectsArgsSchema.omit({
  scope: true,
});
export const addOrganizationProjectParamsSchema = addOrganizationProjectArgsSchema;
export const removeOrganizationProjectParamsSchema = removeOrganizationProjectArgsSchema;
