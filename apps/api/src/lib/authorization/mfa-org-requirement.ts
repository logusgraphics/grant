import type { Scope } from '@grantjs/schema';
import { Tenant } from '@grantjs/schema';

/**
 * Loads `requireMfaForSensitiveActions` for the organization that governs this scope.
 * For `organizationProject` / `organizationProjectUser`, `scope.id` is `organizationId:projectId` (or with `:userId`).
 */
export async function resolveOrgRequiresMfaForSensitiveActions(
  scope: Scope,
  getOrganizations: (params: {
    ids: string[];
    limit: number;
    requestedFields: Array<'requireMfaForSensitiveActions'>;
  }) => Promise<{
    organizations?: Array<{ requireMfaForSensitiveActions?: boolean | null }>;
  }>
): Promise<boolean> {
  if (scope.tenant === Tenant.Organization) {
    const result = await getOrganizations({
      ids: [scope.id],
      limit: 1,
      requestedFields: ['requireMfaForSensitiveActions'],
    });
    return Boolean(result.organizations?.[0]?.requireMfaForSensitiveActions ?? false);
  }
  if (
    scope.tenant === Tenant.OrganizationProject ||
    scope.tenant === Tenant.OrganizationProjectUser
  ) {
    const orgId = scope.id.split(':')[0];
    if (!orgId) {
      return false;
    }
    const result = await getOrganizations({
      ids: [orgId],
      limit: 1,
      requestedFields: ['requireMfaForSensitiveActions'],
    });
    return Boolean(result.organizations?.[0]?.requireMfaForSensitiveActions ?? false);
  }
  return false;
}
