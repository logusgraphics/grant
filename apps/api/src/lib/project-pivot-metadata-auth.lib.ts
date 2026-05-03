import { AuthorizationError } from '@/lib/errors';

/**
 * Pivot metadata may drive permission conditions. Self-managed users must not edit their own
 * pivot metadata; administrators update it on their behalf.
 */
export function assertProjectPivotMetadataMutationAllowed(
  actorUserId: string,
  targetUserId: string,
  targetHasAuthenticationMethods: boolean
): void {
  if (targetHasAuthenticationMethods && actorUserId === targetUserId) {
    throw new AuthorizationError(
      'Project membership metadata is managed by administrators and cannot be self-edited when using authentication'
    );
  }
}
