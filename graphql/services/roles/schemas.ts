import { z } from 'zod';

import {
  idSchema,
  nameSchema,
  descriptionSchema,
  sortOrderSchema,
  baseEntitySchema,
  paginatedResponseSchema,
  sortableParamsSchema,
  nonEmptyNameSchema,
} from '../common/schemas';

export const roleSortableFieldSchema = z.enum(['name']);
export const roleSortInputSchema = z.object({
  field: roleSortableFieldSchema,
  order: sortOrderSchema,
});

export const createRoleInputSchema = z.object({
  name: nonEmptyNameSchema,
  description: descriptionSchema,
});

export const updateRoleInputSchema = z.object({
  name: nonEmptyNameSchema.optional(),
  description: descriptionSchema,
});

export const createRoleArgsSchema = z.object({
  input: createRoleInputSchema,
});

export const updateRoleArgsSchema = z.object({
  id: idSchema,
  input: updateRoleInputSchema,
});

export const deleteRoleArgsSchema = z.object({
  id: idSchema,
});

export const queryRolesArgsSchema = sortableParamsSchema.extend({
  ids: z.array(idSchema).optional(),
  tagIds: z.array(idSchema).optional(),
  sort: roleSortInputSchema.optional(),
});

export const roleSchema = baseEntitySchema.extend({
  name: nameSchema,
  description: descriptionSchema,
  groups: z.array(z.any()).nullable().optional(),
  tags: z.array(z.any()).nullable().optional(),
});

export const rolePageSchema = paginatedResponseSchema(roleSchema).transform((data) => ({
  roles: data.items,
  hasNextPage: data.hasNextPage,
  totalCount: data.totalCount,
}));

export const getRolesParamsSchema = queryRolesArgsSchema.extend({
  requestedFields: z.array(z.string()).optional(),
});

export const createRoleParamsSchema = createRoleArgsSchema;
export const updateRoleParamsSchema = updateRoleArgsSchema;
export const deleteRoleParamsSchema = deleteRoleArgsSchema;
