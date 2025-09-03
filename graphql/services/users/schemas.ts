import { z } from 'zod';

import { UserSortableField } from '@/graphql/generated/types';

import {
  idSchema,
  emailSchema,
  nameSchema,
  sortOrderSchema,
  baseEntitySchema,
  paginatedResponseSchema,
  nonEmptyNameSchema,
  nonEmptyEmailSchema,
  queryParamsSchema,
  deleteSchema,
} from '../common/schemas';

export const userSortableFieldSchema = z.enum(
  Object.values(UserSortableField) as [UserSortableField, ...UserSortableField[]]
);
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

export const deleteUserArgsSchema = deleteSchema.extend({
  id: idSchema,
});

export const queryUsersArgsSchema = queryParamsSchema.extend({
  sort: userSortInputSchema.nullable().optional(),
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
