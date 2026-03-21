export { GrantClient } from '../grant-client';
export type {
  AuthorizationResult,
  GrantServerConfig,
  PermissionCheckOptions,
  ResourceResolver,
  Scope,
} from '../types';
export type { GrantOptions } from './grant.decorator';
export { Grant, GRANT_OPTIONS_KEY } from './grant.decorator';
export type { AuthorizedRequest, GrantGuardOptions } from './grant.guard';
export { GRANT_GUARD, GrantGuard } from './grant.guard';
export { GRANT_CLIENT, GrantModule } from './grant.module';
