import { SortOrder } from '@logusgraphics/grant-schema';

import { z } from '@/lib/zod-openapi.lib';
import {
  createSuccessResponseSchema,
  listQuerySchema,
  scopeSchema,
  tenantSchema,
} from '@/rest/schemas/common.schemas';

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

export const userWithRelationsSchema = userSchema.extend({
  roles: z.array(z.unknown()).optional(),
  tags: z.array(z.unknown()).optional(),
  accounts: z.array(z.unknown()).optional(),
  authenticationMethods: z.array(z.unknown()).optional(),
});

export const userRelationsEnum = z.enum(['roles', 'tags', 'accounts', 'authenticationMethods']);

export const getUsersQuerySchema = listQuerySchema.omit({ relations: true }).extend({
  scopeId: z.string().uuid('Invalid scope ID'),
  tenant: tenantSchema,
  sortField: z.enum(['name', 'createdAt', 'updatedAt']).optional(),
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
    .array(userRelationsEnum)
    .optional()
    .openapi({
      description: 'Related entities to include in the response',
      example: ['roles', 'tags'],
    }),
});

export const getUsersResponseSchema = createSuccessResponseSchema(
  z.object({
    items: z.array(userWithRelationsSchema),
    totalCount: z.number(),
    hasNextPage: z.boolean(),
  }),
  'Paginated list of users'
);

export const createUserRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').openapi({
    description: "User's full name",
    example: 'John Doe',
  }),
  scope: scopeSchema,
  roleIds: z
    .array(z.string())
    .optional()
    .openapi({
      description: 'Array of role IDs to assign to the user',
      example: ['123e4567-e89b-12d3-a456-426614174001'],
    }),
  tagIds: z
    .array(z.string())
    .optional()
    .openapi({
      description: 'Array of tag IDs to assign to the user',
      example: ['123e4567-e89b-12d3-a456-426614174002'],
    }),
  primaryTagId: z.string().optional().openapi({
    description: 'Primary tag ID for the user',
    example: '123e4567-e89b-12d3-a456-426614174002',
  }),
});

export const createUserResponseSchema = createSuccessResponseSchema(
  userSchema,
  'Successfully created user'
);

export const updateUserRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional().openapi({
    description: "Updated user's full name",
    example: 'Jane Doe',
  }),
  roleIds: z
    .array(z.string())
    .optional()
    .openapi({
      description: 'Array of role IDs to assign to the user',
      example: ['123e4567-e89b-12d3-a456-426614174001'],
    }),
  tagIds: z
    .array(z.string())
    .optional()
    .openapi({
      description: 'Array of tag IDs to assign to the user',
      example: ['123e4567-e89b-12d3-a456-426614174002'],
    }),
  primaryTagId: z.string().optional().openapi({
    description: 'Primary tag ID for the user',
    example: '123e4567-e89b-12d3-a456-426614174002',
  }),
});

export const userParamsSchema = z.object({
  id: z
    .string()
    .uuid('Invalid user ID')
    .openapi({
      description: 'UUID of the user',
      example: '123e4567-e89b-12d3-a456-426614174003',
      param: { in: 'path', name: 'id' },
    }),
});

export const updateUserResponseSchema = createSuccessResponseSchema(
  userSchema,
  'Successfully updated user'
);

export const deleteUserQuerySchema = z.object({
  scopeId: z.string().uuid('Invalid scope ID'),
  tenant: tenantSchema,
  hardDelete: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

export const deleteUserResponseSchema = createSuccessResponseSchema(
  userSchema,
  'Successfully deleted user'
);
