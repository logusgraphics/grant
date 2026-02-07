export { withGrant } from './with-grant';
export type { GrantOptions, GrantRouteHandler, WithGrantContext } from './with-grant';

export type {
  GrantServerConfig,
  AuthorizationResult,
  PermissionCheckOptions,
  Scope,
  ResourceResolver,
} from '../types';

export { GrantClient } from '../grant-client';
export { AuthenticationError, AuthorizationError, BadRequestError, NotFoundError } from '../errors';
