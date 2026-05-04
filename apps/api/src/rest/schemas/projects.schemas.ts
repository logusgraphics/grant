import { CDM_EXPORT_SECTIONS } from '@grantjs/core';
import {
  ProjectPermissionsSyncJobSortableField,
  ProjectSortableField,
  SortOrder,
} from '@grantjs/schema';

import { z } from '@/lib/zod-openapi.lib';
import {
  createSuccessResponseSchema,
  jsonSchema,
  listQuerySchema,
  scopeSchema,
  tenantSchema,
} from '@/rest/schemas/common.schemas';

/** OpenAPI-friendly wrapper for downloadable CDM JSON (payload, snapshot, export). */
export const cdmJsonArtifactSchema = jsonSchema.openapi({
  description:
    'CDM JSON document with the same logical shape as SyncProjectPermissionsInput (roleTemplates, userAssignments, optional projectUserApiKeys, etc.).',
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

export const projectWithRelationsSchema = projectSchema.extend({
  roles: z.array(z.unknown()).optional(),
  groups: z.array(z.unknown()).optional(),
  permissions: z.array(z.unknown()).optional(),
  users: z.array(z.unknown()).optional(),
  tags: z.array(z.unknown()).optional(),
});

export const projectRelationsEnum = z.enum(['roles', 'groups', 'permissions', 'users', 'tags']);

export const getProjectsQuerySchema = listQuerySchema.omit({ relations: true }).extend({
  scopeId: z.uuid('errors.validation.invalidScopeId'),
  tenant: tenantSchema,
  sortField: z
    .enum(Object.values(ProjectSortableField) as [ProjectSortableField, ...ProjectSortableField[]])
    .optional(),
  sortOrder: z.nativeEnum(SortOrder).optional(),
  tagIds: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => {
      if (typeof val === 'string') {
        return val.split(',').map((v) => v.trim());
      }
      return val;
    })
    .optional(),
  relations: z
    .array(projectRelationsEnum)
    .optional()
    .openapi({
      description: 'Related entities to include in the response',
      example: ['roles', 'users', 'tags'],
    }),
});

export const getProjectsResponseSchema = createSuccessResponseSchema(
  z.object({
    items: z.array(projectWithRelationsSchema),
    totalCount: z.number(),
    hasNextPage: z.boolean(),
  })
);

export const createProjectRequestSchema = z.object({
  name: z
    .string()
    .min(1, 'errors.validation.nameRequired')
    .max(255, 'errors.validation.nameTooLong')
    .openapi({
      description: 'Name of the project',
      example: 'Mobile App',
    }),
  description: z.string().optional().openapi({
    description: 'Description of the project',
    example: 'iOS and Android mobile application',
  }),
  scope: scopeSchema,
  tagIds: z
    .array(z.string())
    .optional()
    .openapi({
      description: 'Array of tag IDs to assign to the project',
      example: ['123e4567-e89b-12d3-a456-426614174001'],
    }),
  primaryTagId: z.string().optional().openapi({
    description: 'Primary tag ID for the project',
    example: '123e4567-e89b-12d3-a456-426614174001',
  }),
});

export const createProjectResponseSchema = createSuccessResponseSchema(projectSchema);

export const updateProjectRequestSchema = z.object({
  scope: scopeSchema,
  name: z
    .string()
    .min(1, 'errors.validation.nameRequired')
    .max(255, 'errors.validation.nameTooLong')
    .optional()
    .openapi({
      description: 'Updated name of the project',
      example: 'Mobile App v2',
    }),
  description: z.string().optional().openapi({
    description: 'Updated description of the project',
    example: 'Next generation mobile application',
  }),
  tagIds: z
    .array(z.string())
    .optional()
    .openapi({
      description: 'Array of tag IDs to assign to the project',
      example: ['123e4567-e89b-12d3-a456-426614174001'],
    }),
  primaryTagId: z.string().optional().openapi({
    description: 'Primary tag ID for the project',
    example: '123e4567-e89b-12d3-a456-426614174001',
  }),
});

export const projectParamsSchema = z.object({
  id: z.uuid('errors.validation.invalidProjectId').openapi({
    description: 'UUID of the project',
    example: '123e4567-e89b-12d3-a456-426614174005',
    param: { in: 'path', name: 'id' },
  }),
});

export const updateProjectResponseSchema = createSuccessResponseSchema(projectSchema);

export const deleteProjectQuerySchema = z.object({
  scopeId: z.uuid('errors.validation.invalidScopeId'),
  tenant: tenantSchema,
  hardDelete: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

export const deleteProjectResponseSchema = createSuccessResponseSchema(projectSchema);

const permissionRefCdmSchema = z.object({
  resourceSlug: z.string().min(1),
  action: z.string().min(1),
  permissionId: z.uuid().optional(),
  condition: z.record(z.string(), z.unknown()).optional().nullable(),
});

const roleTemplateCdmSchema = z.object({
  externalKey: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  permissionRefs: z.array(permissionRefCdmSchema),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
  tagKeys: z.array(z.string().min(1)).optional(),
  groupTagKeys: z.array(z.string().min(1)).optional(),
});

const userAssignmentCdmSchema = z.object({
  userId: z.uuid(),
  roleTemplateKeys: z.array(z.string()).optional(),
  directPermissionRefs: z.array(permissionRefCdmSchema).optional(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
  tagKeys: z.array(z.string().min(1)).optional(),
});

const tagCdmSchema = z.object({
  externalKey: z.string().min(1),
  name: z.string().min(1).max(255),
  color: z.string().min(1).max(50),
  isPrimary: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

const projectUserApiKeyCdmSchema = z.object({
  externalKey: z.string().min(1).optional().nullable(),
  userId: z.uuid(),
  clientId: z.string().min(1).max(255).optional().nullable(),
  /**
   * Plaintext secret for BYOK import (min 32 chars). Omitted keys are rejected at sync time
   * when this array is non-empty; never present on export payloads.
   */
  clientSecret: z.string().min(32, 'errors.validation.clientSecretMin32').optional(),
  name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

/**
 * Body for POST /api/projects/:id/permissions/sync-jobs.
 *
 * Enqueues an asynchronous canonical-data-model permission sync. The request
 * returns immediately with a job descriptor; clients poll the job resource
 * for status. Pass `importId` to make the request idempotent — if an active
 * job already exists for the same `(project, importId)` it is returned instead
 * of creating a new one.
 */
export const startProjectPermissionsSyncRequestSchema = z.object({
  scope: scopeSchema,
  cdmVersion: z.number().int(),
  importId: z.string().optional(),
  roleTemplates: z.array(roleTemplateCdmSchema),
  userAssignments: z.array(userAssignmentCdmSchema),
  projectUserApiKeys: z.array(projectUserApiKeyCdmSchema).optional().openapi({
    description:
      'Optional per-user API keys for this project. Each entry requires `clientSecret` (BYOK) when importing; export and rollback snapshots omit secrets.',
  }),
  tags: z.array(tagCdmSchema).optional().openapi({
    description:
      'Optional CDM tags for this project. When present, recreates `tags` rows + `project_tags` membership; role templates and user assignments may then reference these tags via `tagKeys` / `groupTagKeys`. Note: `user_tags` are global rows (cross-project effect).',
  }),
});

export const projectPermissionsSyncJobParamsSchema = z.object({
  id: z.uuid('errors.validation.invalidProjectId').openapi({
    description: 'UUID of the project',
    example: '123e4567-e89b-12d3-a456-426614174005',
    param: { in: 'path', name: 'id' },
  }),
  jobId: z.uuid('errors.validation.invalidJobId').openapi({
    description: 'UUID of the project permissions sync job',
    example: '123e4567-e89b-12d3-a456-426614174099',
    param: { in: 'path', name: 'jobId' },
  }),
});

export const projectPermissionsSyncJobScopeQuerySchema = z.object({
  /**
   * Permission sync only operates against `accountProject` or `organizationProject`
   * scopes whose id is a composite `${parentId}:${projectId}` — so we accept any
   * non-empty string here and let the handler enforce the precise format.
   */
  scopeId: z.string().min(1, 'errors.validation.invalidScopeId'),
  tenant: tenantSchema,
});

const CDM_EXPORT_SECTION_IDS = new Set<string>(CDM_EXPORT_SECTIONS);

/**
 * When a client mistakenly iterates a section name string for `append('sections', …)`,
 * the query becomes repeated single-character values. Collapse those back into one
 * token when they spell a known CDM section id.
 */
function normalizeCdmExportSectionsQueryInput(val: unknown): unknown {
  if (val === undefined || val === '') return val;
  if (!Array.isArray(val)) return val;
  const strings = val.filter((x): x is string => typeof x === 'string');
  if (strings.length < 2) return val;
  if (!strings.every((s) => s.length === 1)) return val;
  const merged = strings.join('');
  return CDM_EXPORT_SECTION_IDS.has(merged) ? merged : val;
}

/**
 * Query for `GET /:id/permissions/export`. Reuses the same scope shape as the
 * sync-job endpoints; `cdmVersion` defaults to 1 — the only supported version
 * — so existing callers can omit it.
 */
export const exportProjectPermissionsQuerySchema = z.object({
  scopeId: z.string().min(1, 'errors.validation.invalidScopeId'),
  tenant: tenantSchema,
  cdmVersion: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === '') return undefined;
      return typeof val === 'string' ? parseInt(val, 10) : val;
    })
    .pipe(z.number().int().min(1).optional()),
  /**
   * CDM slices to include. Repeat `sections=` or use a comma-separated value.
   * Omit or leave empty for a full export (same as sync rollback snapshot).
   * `projectUserApiKeys` requires `userAssignments` in the same request.
   */
  sections: z
    .preprocess(
      normalizeCdmExportSectionsQueryInput,
      z.union([z.string(), z.array(z.string())]).optional()
    )
    .transform((val) => {
      if (val === undefined || val === '') return undefined;
      if (typeof val === 'string') {
        return val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return val.map((s) => s.trim()).filter(Boolean);
    })
    .openapi({
      description:
        'CDM slices to include (repeat `sections` query param or comma-separated). Omit or empty = full export.',
      example: 'roleTemplates,userAssignments',
    }),
});

const syncProjectPermissionsResultSchema = z.object({
  projectId: z.string(),
  importId: z.string().nullable(),
  rolesCreated: z.number(),
  groupsCreated: z.number(),
  roleGroupsLinked: z.number(),
  groupPermissionsLinked: z.number(),
  projectRolesLinked: z.number(),
  projectGroupsLinked: z.number(),
  projectPermissionsLinked: z.number(),
  projectResourcesLinked: z.number(),
  projectUsersEnsured: z.number(),
  userRolesAssigned: z.number(),
  projectUserApiKeysCreated: z.number(),
  tagsCreated: z.number(),
  projectTagsLinked: z.number(),
  roleTagsLinked: z.number(),
  groupTagsLinked: z.number(),
  userTagsLinked: z.number(),
  warnings: z.array(z.string()),
});

export const projectPermissionsSyncJobStatusEnum = z.enum([
  'PENDING',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

export const projectPermissionsSyncJobSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  status: projectPermissionsSyncJobStatusEnum,
  cdmVersion: z.number().int(),
  importId: z.string().nullable(),
  result: syncProjectPermissionsResultSchema.nullable(),
  warnings: z.array(z.string()),
  errorMessage: z.string().nullable(),
  enqueuedAt: z.string(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  hasSnapshot: z.boolean().openapi({
    description:
      'Whether a pre-sync rollback snapshot was captured before this job modified the project.',
  }),
  snapshotTakenAt: z.string().nullable().openapi({
    description: 'ISO timestamp when the snapshot was captured, if any.',
  }),
  snapshotSizeBytes: z.number().int().nullable().openapi({
    description: 'Serialized snapshot size in bytes, if a snapshot exists.',
  }),
});

export const projectPermissionsSyncJobResponseSchema = createSuccessResponseSchema(
  projectPermissionsSyncJobSchema
);

/**
 * Query for listing project permissions sync jobs.
 * Reuses the standard pagination/search shape and adds a status filter and the
 * scope query params shared with the single-job endpoint.
 */
export const listProjectPermissionsSyncJobsQuerySchema = listQuerySchema
  .omit({ relations: true, ids: true })
  .extend({
    scopeId: z.string().min(1, 'errors.validation.invalidScopeId'),
    tenant: tenantSchema,
    sortField: z
      .enum(
        Object.values(ProjectPermissionsSyncJobSortableField) as [
          ProjectPermissionsSyncJobSortableField,
          ...ProjectPermissionsSyncJobSortableField[],
        ]
      )
      .optional(),
    sortOrder: z.nativeEnum(SortOrder).optional(),
    status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional().openapi({
      description: 'Filter by lifecycle status',
      example: 'PENDING',
    }),
  });

export const listProjectPermissionsSyncJobsResponseSchema = createSuccessResponseSchema(
  z.object({
    jobs: z.array(projectPermissionsSyncJobSchema),
    totalCount: z.number(),
    hasNextPage: z.boolean(),
  })
);
