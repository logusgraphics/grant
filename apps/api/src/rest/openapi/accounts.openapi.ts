import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import {
  accountParamsSchema,
  accountSchema,
  accountWithRelationsSchema,
  authenticationErrorResponseSchema,
  errorResponseSchema,
  getAccountsQuerySchema,
  getAccountsResponseSchema,
  notFoundErrorResponseSchema,
  validationErrorResponseSchema,
} from '../schemas';
import { createSuccessResponseSchema } from '../schemas/common.schemas';

export function registerAccountsOpenApi(registry: OpenAPIRegistry) {
  registry.register('Account', accountSchema);
  registry.register('AccountWithRelations', accountWithRelationsSchema);
  registry.register('GetAccountsQuery', getAccountsQuerySchema);
  registry.register('GetAccountsResponse', getAccountsResponseSchema);
  registry.register('GetAccountResponse', createSuccessResponseSchema(accountWithRelationsSchema));
  registry.register('AccountParams', accountParamsSchema);

  /**
   * GET /api/accounts
   * List accounts with optional filtering, pagination, and relations
   */
  registry.registerPath({
    method: 'get',
    path: '/api/accounts',
    tags: ['Accounts'],
    summary: 'List accounts',
    description: `
List all accounts with optional filtering, pagination, sorting, and relation loading.

### Relations
You can load related data by specifying the \`relations\` query parameter:
- \`projects\`: Load account's projects
- \`owner\`: Load account owner (user)

Example: \`?relations=projects,owner\`
    `.trim(),
    request: {
      query: getAccountsQuerySchema,
    },
    responses: {
      200: {
        description: 'Successfully retrieved accounts',
        content: {
          'application/json': {
            schema: getAccountsResponseSchema,
            example: {
              success: true,
              data: {
                items: [
                  {
                    id: 'acc_123',
                    name: 'Acme Corp',
                    slug: 'acme-corp',
                    username: 'acme',
                    type: 'organization',
                    ownerId: 'usr_456',
                    createdAt: '2025-10-11T00:00:00Z',
                    updatedAt: '2025-10-11T00:00:00Z',
                    deletedAt: null,
                    projects: [
                      {
                        id: 'prj_789',
                        name: 'Project Alpha',
                      },
                    ],
                  },
                ],
                totalCount: 1,
                hasNextPage: false,
              },
            },
          },
        },
      },
      400: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: validationErrorResponseSchema,
          },
        },
      },
      401: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: authenticationErrorResponseSchema,
          },
        },
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });

  /**
   * GET /api/accounts/:id
   * Get a single account by ID
   */
  registry.registerPath({
    method: 'get',
    path: '/api/accounts/{id}',
    tags: ['Accounts'],
    summary: 'Get account by ID',
    description: `
Get a single account by ID with optional relation loading.

### Relations
You can load related data by specifying the \`relations\` query parameter:
- \`projects\`: Load account's projects
- \`owner\`: Load account owner (user)

Example: \`?relations=projects,owner\`

**Note**: Account creation, update, and deletion are handled through the authentication registration flow (POST /api/auth/register).
    `.trim(),
    request: {
      params: accountParamsSchema,
      query: getAccountsQuerySchema,
    },
    responses: {
      200: {
        description: 'Successfully retrieved account',
        content: {
          'application/json': {
            schema: createSuccessResponseSchema(accountWithRelationsSchema),
            example: {
              success: true,
              data: {
                id: 'acc_123',
                name: 'Acme Corp',
                slug: 'acme-corp',
                username: 'acme',
                type: 'organization',
                ownerId: 'usr_456',
                createdAt: '2025-10-11T00:00:00Z',
                updatedAt: '2025-10-11T00:00:00Z',
                deletedAt: null,
                projects: [
                  {
                    id: 'prj_789',
                    name: 'Project Alpha',
                  },
                ],
              },
            },
          },
        },
      },
      400: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: validationErrorResponseSchema,
          },
        },
      },
      401: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: authenticationErrorResponseSchema,
          },
        },
      },
      404: {
        description: 'Account not found',
        content: {
          'application/json': {
            schema: notFoundErrorResponseSchema,
          },
        },
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });
}
