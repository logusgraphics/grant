import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

// import {
//   errorResponseSchema,
//   validationErrorResponseSchema,
//   authenticationErrorResponseSchema,
// } from '@/rest/schemas';

/**
 * Register user management endpoints in the OpenAPI registry
 */
export function registerUserEndpoints(registry: OpenAPIRegistry) {
  // registry.registerPath({
  //   method: 'get',
  //   path: '/api/users',
  //   tags: ['Users'],
  //   summary: 'List users',
  //   description: 'Get a paginated list of users',
  //   request: {
  //     query: getUsersQuerySchema,
  //   },
  //   responses: {
  //     200: { ... },
  //     401: { ... },
  //     500: { ... },
  //   },
  // });
}
