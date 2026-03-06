import { z } from 'zod';

import { normalizePermissionSlug } from '@/lib/permission-normalizer';

import { jsonSchema } from './common';

export const isAuthorizedInputSchema = z.object({
  permission: z
    .object({
      resource: z.string().min(1, 'errors.validation.resourceRequired'),
      action: z.string().min(1, 'errors.validation.actionRequired'),
    })
    .transform((p) => ({
      resource: normalizePermissionSlug(p.resource),
      action: normalizePermissionSlug(p.action),
    }))
    .refine((p) => p.resource.length > 0, {
      message: 'errors.validation.resourceRequired',
      path: ['resource'],
    })
    .refine((p) => p.action.length > 0, {
      message: 'errors.validation.actionRequired',
      path: ['action'],
    }),
  context: z
    .object({
      resource: jsonSchema.nullable().optional(),
    })
    .optional(),
});

export const authorizationResultSchema = z.object({
  authorized: z.boolean(),
  reason: z.string().nullable().optional(),
  matchedPermission: z.unknown().nullable().optional(),
  matchedCondition: z.unknown().nullable().optional(),
  evaluatedContext: z.unknown().nullable().optional(),
});
