/**
 * Grant-domain service port interface.
 * Covers: Grant (signing keys, user permissions/roles/groups resolution).
 */
import type {
  ExecutionContextGroup,
  ExecutionContextRole,
  ExecutionContextUser,
  SessionSigningKey,
} from '../../types';
import type { Permission, Scope, TokenType } from '@grantjs/schema';

// ---------------------------------------------------------------------------
// IGrantService
// ---------------------------------------------------------------------------

export interface IGrantService {
  getSessionSigningKey(): Promise<SessionSigningKey | null>;

  getVerificationKey(kid: string): Promise<string | null>;

  getPublicKeysForJwks(
    scope: Scope | null,
    retentionCutoff: Date
  ): Promise<Array<{ kid: string; publicKeyPem: string }>>;

  invalidateSessionSigningKeyCache(): Promise<void>;

  rotateSystemSigningKey(transaction?: unknown): Promise<{ kid: string; createdAt: Date }>;

  getSigningKeyForScope(scope: Scope, transaction?: unknown): Promise<SessionSigningKey | null>;

  getUserPermissions(
    userId: string,
    scope: Scope,
    resourceSlug: string,
    action: string,
    tokenType?: TokenType
  ): Promise<Permission[]>;

  /**
   * Return which of the candidate scope slugs (resource:action) the user is granted in the given scope.
   * Used for project-app token scope intersection.
   */
  getGrantedScopeSlugs(userId: string, scope: Scope, candidateSlugs: string[]): Promise<string[]>;

  getUserRoles(
    userId: string,
    scope: Scope,
    tokenType?: TokenType
  ): Promise<ExecutionContextRole[]>;

  getUserGroups(
    userId: string,
    scope: Scope,
    tokenType?: TokenType
  ): Promise<ExecutionContextGroup[]>;

  getUser(userId: string, scope?: Scope): Promise<ExecutionContextUser>;
}
