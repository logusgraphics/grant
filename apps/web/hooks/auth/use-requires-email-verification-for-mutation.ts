'use client';

import { Scope, Tenant } from '@grantjs/schema';

import { useEmailVerificationStatus } from './use-email-verification-status';

export interface UseRequiresEmailVerificationForMutationOptions {
  /**
   * When true (default), unverified users are allowed in personal account/project context.
   * When false, email verification is required even in personal context (matches API
   * BLOCK_UNVERIFIED / allowPersonalContext: false for org-only flows).
   */
  allowPersonalContext?: boolean;
}

/**
 * Hook to determine if email verification is required for mutations in the given scope.
 * Mirrors API guards: requireEmailVerificationRest/requireEmailVerificationGraphQL.
 *
 * **Rules:**
 * - Verified users: Always allowed
 * - Organization context: Verification required
 * - Personal context: Depends on allowPersonalContext (default true = not required)
 *
 * @param scope - The scope to check (optional; if missing, returns true unless allowPersonalContext is used for a known-personal flow)
 * @param options - Optional. allowPersonalContext (default true) — when false, require verification even in personal context
 * @returns `true` if email verification is required, `false` otherwise
 *
 * @example
 * ```tsx
 * const scope = useScopeFromParams();
 * const requiresVerification = useRequiresEmailVerificationForMutation(scope);
 * if (requiresVerification) return <div>Please verify your email</div>;
 * ```
 *
 * @example Block unverified even in personal context (e.g. org-only UI)
 * ```tsx
 * const requiresVerification = useRequiresEmailVerificationForMutation(scope, { allowPersonalContext: false });
 * ```
 */
export function useRequiresEmailVerificationForMutation(
  scope: Scope | null | undefined,
  options: UseRequiresEmailVerificationForMutationOptions = {}
): boolean {
  const { allowPersonalContext = true } = options;
  const { isVerified } = useEmailVerificationStatus();

  if (isVerified) {
    return false;
  }

  if (!scope) {
    return true;
  }

  const isOrganizationContext =
    scope.tenant === Tenant.Organization ||
    scope.tenant === Tenant.OrganizationProject ||
    scope.tenant === Tenant.OrganizationProjectUser;

  const isPersonalAccountContext =
    scope.tenant === Tenant.Account ||
    scope.tenant === Tenant.AccountProject ||
    scope.tenant === Tenant.AccountProjectUser;

  if (isOrganizationContext) {
    return true;
  }

  if (isPersonalAccountContext) {
    return !allowPersonalContext;
  }

  return true;
}
