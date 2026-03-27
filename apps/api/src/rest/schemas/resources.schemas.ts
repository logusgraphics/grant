import { ResourceSortableField, SortOrder } from '@grantjs/schema';

import { z } from '@/lib/zod-openapi.lib';
import {
  actionSlugSchema,
  createSuccessResponseSchema,
  listQuerySchema,
  scopeIdSchema,
  scopeSchema,
  tenantSchema,
} from '@/rest/schemas/common.schemas';
import { permissionSchema } from '@/rest/schemas/permissions.schemas';

export const resourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  actions: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

export const resourceWithRelationsSchema = resourceSchema.extend({
  permissions: z
    .array(
      permissionSchema.extend({
        resourceId: z.string().nullable().optional(),
        condition: z.unknown().nullable().optional(),
      })
    )
    .optional(),
});

export const getResourcesQuerySchema = listQuerySchema.omit({ relations: true }).extend({
  scopeId: scopeIdSchema,
  tenant: tenantSchema,
  sortField: z
    .enum(
      Object.values(ResourceSortableField) as [ResourceSortableField, ...ResourceSortableField[]]
    )
    .optional(),
  sortOrder: z.nativeEnum(SortOrder).optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
});

export const getResourcesResponseSchema = createSuccessResponseSchema(
  z.object({
    items: z.array(resourceWithRelationsSchema),
    totalCount: z.number(),
    hasNextPage: z.boolean(),
  })
);

export const createResourceRequestSchema = z.object({
  name: z
    .string()
    .min(1, 'errors.validation.nameRequired')
    .max(255, 'errors.validation.nameTooLong')
    .openapi({
      description: 'Name of the resource',
      example: 'User Documents',
    }),
  slug: z
    .string()
    .min(1, 'errors.validation.slugRequired')
    .max(255, 'errors.validation.slugTooLong')
    .regex(/^[a-z0-9-]+$/, 'errors.validation.slugInvalidFormat')
    .openapi({
      description: 'URL-friendly identifier for the resource',
      example: 'user-documents',
    }),
  description: z.string().optional().openapi({
    description: 'Description of the resource',
    example: 'Documents uploaded by users',
  }),
  actions: z
    .array(actionSlugSchema)
    .optional()
    .openapi({
      description:
        'Array of actions available for this resource (lowercase, letters/digits/dashes/plus only)',
      example: ['read', 'write', 'delete'],
    }),
  isActive: z.boolean().optional().default(true).openapi({
    description: 'Whether the resource is active',
    example: true,
  }),
  scope: scopeSchema,
  tagIds: z
    .array(z.string())
    .optional()
    .openapi({
      description: 'Array of tag IDs to assign to the resource',
      example: ['123e4567-e89b-12d3-a456-426614174001'],
    }),
  primaryTagId: z.string().optional().openapi({
    description: 'Primary tag ID for the resource',
    example: '123e4567-e89b-12d3-a456-426614174001',
  }),
  createPermissions: z.boolean().optional().default(false).openapi({
    description:
      'When true, create one permission per action defined on the resource (project-scoped)',
    example: false,
  }),
});

export const createResourceResponseSchema = createSuccessResponseSchema(
  resourceWithRelationsSchema
);

export const updateResourceRequestSchema = z.object({
  name: z
    .string()
    .min(1, 'errors.validation.nameRequired')
    .max(255, 'errors.validation.nameTooLong')
    .optional()
    .openapi({
      description: 'Updated name of the resource',
      example: 'User Documents and Files',
    }),
  slug: z
    .string()
    .min(1, 'errors.validation.slugRequired')
    .max(255, 'errors.validation.slugTooLong')
    .regex(/^[a-z0-9-]+$/, 'errors.validation.slugInvalidFormat')
    .optional()
    .openapi({
      description: 'Updated URL-friendly identifier for the resource',
      example: 'user-documents-files',
    }),
  description: z.string().optional().openapi({
    description: 'Updated description of the resource',
    example: 'Documents and files uploaded by users',
  }),
  actions: z
    .array(actionSlugSchema)
    .optional()
    .openapi({
      description:
        'Updated array of actions available for this resource (lowercase, letters/digits/dashes/plus only)',
      example: ['read', 'write', 'delete', 'share'],
    }),
  isActive: z.boolean().optional().openapi({
    description: 'Updated active status of the resource',
    example: true,
  }),
  tagIds: z
    .array(z.string())
    .optional()
    .openapi({
      description: 'Array of tag IDs to assign to the resource',
      example: ['123e4567-e89b-12d3-a456-426614174001'],
    }),
  primaryTagId: z.string().optional().openapi({
    description: 'Primary tag ID for the resource',
    example: '123e4567-e89b-12d3-a456-426614174001',
  }),
});

export const resourceParamsSchema = z.object({
  id: z
    .string()
    .uuid('errors.validation.invalidResourceId')
    .openapi({
      description: 'UUID of the resource',
      example: '123e4567-e89b-12d3-a456-426614174001',
      param: { in: 'path', name: 'id' },
    }),
});

export const updateResourceResponseSchema = createSuccessResponseSchema(resourceSchema);

export const deleteResourceQuerySchema = z.object({
  scopeId: scopeIdSchema,
  tenant: tenantSchema,
  hardDelete: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

export const deleteResourceResponseSchema = createSuccessResponseSchema(resourceSchema);
