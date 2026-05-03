import { Scope, Tenant } from '@grantjs/schema';

/**
 * Returns projectId when scope embeds it (composite `scope.id`), else null.
 * Mirrors {@link CacheHandler.extractProjectIdFromScope} without throwing.
 */
export function tryProjectIdFromScope(scope: Scope): string | null {
  const validTenants = [
    Tenant.AccountProject,
    Tenant.OrganizationProject,
    Tenant.AccountProjectUser,
    Tenant.OrganizationProjectUser,
  ];
  if (!validTenants.includes(scope.tenant)) {
    return null;
  }
  const parts = scope.id.split(':');
  const projectId = parts[1];
  return projectId ?? null;
}
