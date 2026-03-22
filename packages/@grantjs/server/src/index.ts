// Core client
export { GrantClient } from './grant-client';
export type { AuthorizationResult, GrantServerConfig, PermissionCheckOptions } from './types';

// Error classes
export {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  GrantServerError,
  NotFoundError,
} from './errors';

// Utilities
export { extractBearerToken, extractTokenFromRequest } from './utils/token-extractor';

// Types
export type {
  ResourceResolver,
  ResourceResolverParams,
  ResourceResolverResult,
  Scope,
  Tenant,
} from './types';
