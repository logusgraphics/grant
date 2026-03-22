import { z } from 'zod';

import { baseEntitySchema, deleteSchema, idSchema } from './common/schemas';

export const getOrganizationUsersParamsSchema = z.object({
  organizationId: idSchema,
  userId: idSchema.optional(),
});

export const addOrganizationUserParamsSchema = z.object({
  organizationId: idSchema,
  userId: idSchema,
  roleId: idSchema,
});

export const removeOrganizationUserParamsSchema = deleteSchema.extend({
  organizationId: idSchema,
  userId: idSchema,
});

export const organizationUserSchema = baseEntitySchema.extend({
  organizationId: idSchema,
  userId: idSchema,
  roleId: idSchema,
});
