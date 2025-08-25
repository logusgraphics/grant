import { z } from 'zod';

import { idSchema, baseEntitySchema } from '../common/schemas';

export const getOrganizationUsersParamsSchema = z.object({
  organizationId: idSchema,
});

export const addOrganizationUserParamsSchema = z.object({
  input: z.object({
    organizationId: idSchema,
    userId: idSchema,
  }),
});

export const removeOrganizationUserParamsSchema = z.object({
  input: z.object({
    organizationId: idSchema,
    userId: idSchema,
  }),
});

export const organizationUserSchema = baseEntitySchema.extend({
  organizationId: idSchema,
  userId: idSchema,
});
