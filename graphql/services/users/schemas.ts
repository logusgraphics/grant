import { z } from 'zod';

import {
  idSchema,
  emailSchema,
  nameSchema,
  sortOrderSchema,
  baseEntitySchema,
  paginatedResponseSchema,
  sortableParamsSchema,
  nonEmptyNameSchema,
  nonEmptyEmailSchema,
} from '../common/schemas';

export const userSortableFieldSchema = z.enum(['email', 'name']);
export const userSortInputSchema = z.object({
  field: userSortableFieldSchema,
  order: sortOrderSchema,
});

export const createUserInputSchema = z.object({
  email: nonEmptyEmailSchema,
  name: nonEmptyNameSchema,
});

export const updateUserInputSchema = z.object({
  email: nonEmptyEmailSchema,
  name: nonEmptyNameSchema,
});

export const createUserArgsSchema = z.object({
  input: createUserInputSchema,
});

export const updateUserArgsSchema = z.object({
  id: idSchema,
  input: updateUserInputSchema,
});

export const deleteUserArgsSchema = z.object({
  id: idSchema,
});

export const queryUsersArgsSchema = sortableParamsSchema.extend({
  ids: z.array(idSchema).optional(),
  tagIds: z.array(idSchema).optional(),
  sort: userSortInputSchema.optional(),
});

export const userSchema = baseEntitySchema.extend({
  name: nameSchema,
  email: emailSchema,
  roles: z.array(z.any()).nullable().optional(),
  tags: z.array(z.any()).nullable().optional(),
});

export const userPageSchema = paginatedResponseSchema(userSchema).transform((data) => ({
  users: data.items,
  hasNextPage: data.hasNextPage,
  totalCount: data.totalCount,
}));

export const getUsersParamsSchema = queryUsersArgsSchema.extend({
  requestedFields: z.array(z.string()).optional(),
});

export const createUserParamsSchema = createUserArgsSchema;
export const updateUserParamsSchema = updateUserArgsSchema;
export const deleteUserParamsSchema = deleteUserArgsSchema;
