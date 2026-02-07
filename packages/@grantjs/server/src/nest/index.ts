export { GrantGuard, GRANT_GUARD } from './grant.guard';
export type { AuthorizedRequest, GrantGuardOptions } from './grant.guard';

export { Grant, GRANT_OPTIONS_KEY } from './grant.decorator';
export type { GrantOptions } from './grant.decorator';

export { GrantModule, GRANT_CLIENT } from './grant.module';

export type {
  GrantServerConfig,
  AuthorizationResult,
  PermissionCheckOptions,
  Scope,
  ResourceResolver,
} from '../types';

export { GrantClient } from '../grant-client';
