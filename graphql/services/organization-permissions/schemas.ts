import { z } from 'zod';

import { idSchema, scopeSchema } from '../common/schemas';

export const queryOrganizationPermissionsArgsSchema = z.object({
  scope: scopeSchema,
  organizationId: idSchema,
});

export const addOrganizationPermissionInputSchema = z.object({
  organizationId: idSchema.refine(
    (organizationId) => organizationId.trim().length > 0,
    'Organization ID is required'
  ),
  permissionId: idSchema.refine(
    (permissionId) => permissionId.trim().length > 0,
    'Permission ID is required'
  ),
});

export const removeOrganizationPermissionInputSchema = z.object({
  organizationId: idSchema.refine(
    (organizationId) => organizationId.trim().length > 0,
    'Organization ID is required'
  ),
  permissionId: idSchema.refine(
    (permissionId) => permissionId.trim().length > 0,
    'Permission ID is required'
  ),
});

export const addOrganizationPermissionArgsSchema = z.object({
  input: addOrganizationPermissionInputSchema,
});

export const removeOrganizationPermissionArgsSchema = z.object({
  input: removeOrganizationPermissionInputSchema,
});

export const organizationPermissionSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  permissionId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
  organization: z.any().nullable().optional(),
  permission: z.any().nullable().optional(),
});

export const getOrganizationPermissionsParamsSchema = queryOrganizationPermissionsArgsSchema.omit({
  scope: true,
});
export const addOrganizationPermissionParamsSchema = addOrganizationPermissionArgsSchema;
export const removeOrganizationPermissionParamsSchema = removeOrganizationPermissionArgsSchema;

export type GetOrganizationPermissionsParams = z.infer<
  typeof getOrganizationPermissionsParamsSchema
>;
export type AddOrganizationPermissionParams = z.infer<typeof addOrganizationPermissionParamsSchema>;
export type RemoveOrganizationPermissionParams = z.infer<
  typeof removeOrganizationPermissionParamsSchema
>;
export type OrganizationPermissionSchema = z.infer<typeof organizationPermissionSchema>;
