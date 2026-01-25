'use client';

import { Scope, Tenant } from '@grantjs/schema';

import { useEmailVerificationStatus } from './use-email-verification-status';

/**
 * Hook to determine if email verification is required for mutations in the given scope
 *
 * **Rules:**
 * - Personal accounts/projects: Email verification NOT required (allow mutations)
 * - Organization accounts/projects: Email verification REQUIRED (block mutations)
 * - Verified users: Always allowed
 *
 * @param scope - The scope to check (optional, will return false if not provided)
 * @returns `true` if email verification is required, `false` otherwise
 *
 * @example
 * ```tsx
 * const scope = useScopeFromParams();
 * const requiresVerification = useRequiresEmailVerificationForMutation(scope);
 *
 * if (requiresVerification) {
 *   return <div>Please verify your email to use this feature</div>;
 * }
 * ```
 */
export function useRequiresEmailVerificationForMutation(
  scope: Scope | null | undefined
): boolean {
  const { isVerified } = useEmailVerificationStatus();

  // If verified, no verification required
  if (isVerified) {
    return false;
  }

  // If no scope provided, default to requiring verification (conservative approach)
  if (!scope) {
    return true;
  }

  // Check if scope is in organization context
  const isOrganizationContext =
    scope.tenant === Tenant.Organization ||
    scope.tenant === Tenant.OrganizationProject ||
    scope.tenant === Tenant.OrganizationProjectUser;

  // Check if scope is in personal account context
  const isPersonalAccountContext =
    scope.tenant === Tenant.Account ||
    scope.tenant === Tenant.AccountProject ||
    scope.tenant === Tenant.AccountProjectUser;

  // Organization context: require verification
  if (isOrganizationContext) {
    return true;
  }

  // Personal account context: do not require verification
  if (isPersonalAccountContext) {
    return false;
  }

  // Unknown context: default to requiring verification (conservative approach)
  return true;
}
