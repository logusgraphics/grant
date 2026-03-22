// Fastify plugin and preHandler hook
export type { AuthorizedFastifyRequest, GrantOptions, GrantPluginOptions } from './plugin';
export { grant, grantPlugin } from './plugin';

// Re-export core types for convenience
export type {
  AuthorizationResult,
  GrantServerConfig,
  PermissionCheckOptions,
  ResourceResolver,
  Scope,
} from '../types';

// Re-export error classes
export {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  GrantServerError,
  NotFoundError,
} from '../errors';

// Re-export GrantClient
export { GrantClient } from '../grant-client';
