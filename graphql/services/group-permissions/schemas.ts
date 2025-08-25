import { z } from 'zod';

import { idSchema, baseEntitySchema } from '../common/schemas';

export const getGroupPermissionsParamsSchema = z.object({
  groupId: idSchema,
});

export const addGroupPermissionParamsSchema = z.object({
  input: z.object({
    groupId: idSchema,
    permissionId: idSchema,
  }),
});

export const removeGroupPermissionParamsSchema = z.object({
  input: z.object({
    groupId: idSchema,
    permissionId: idSchema,
  }),
});

export const groupPermissionSchema = baseEntitySchema.extend({
  groupId: idSchema,
  permissionId: idSchema,
});
