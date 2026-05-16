import { Tenant } from '@grantjs/schema';

import { CDM_IMPORT_METADATA_KEY } from '@/constants/cdm-import.constants';
import { ValidationError } from '@/lib/errors';

/**
 * Shallow merge for permission evaluation and project-scoped user listing:
 * project pivot overrides global keys on collision.
 */
export function mergeEffectiveUserMetadataForProject(
  globalMetadata: Record<string, unknown>,
  projectPivotMetadata: Record<string, unknown>
): Record<string, unknown> {
  return { ...globalMetadata, ...projectPivotMetadata };
}

/**
 * Project pivot overrides global identity when present (non-nullish).
 */
export function mergeEffectiveUserProfileForProject(
  globalName: string,
  globalPictureUrl: string | null | undefined,
  pivotDisplayName: string | null | undefined,
  pivotPictureUrl: string | null | undefined
): { name: string; pictureUrl: string | null | undefined } {
  return {
    name: pivotDisplayName ?? globalName,
    pictureUrl: pivotPictureUrl ?? globalPictureUrl ?? null,
  };
}

const PARENT_PROJECT_SCOPES_FOR_PIVOT_WRITES: ReadonlySet<Tenant> = new Set([
  Tenant.AccountProject,
  Tenant.OrganizationProject,
]);

/** Only AccountProject / OrganizationProject may write pivot profile + metadata via updateUser. */
export function isParentProjectScopeForPivotWrites(tenant: Tenant): boolean {
  return PARENT_PROJECT_SCOPES_FOR_PIVOT_WRITES.has(tenant);
}

/** Leaf scopes must use parent scope for pivot mutations (plan: unsupported here). */
export function isUnsupportedProjectUserMutationLeafTenant(tenant: Tenant): boolean {
  return tenant === Tenant.AccountProjectUser || tenant === Tenant.OrganizationProjectUser;
}

function normalizeMetadata(raw: unknown): Record<string, unknown> {
  if (raw != null && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

/**
 * Apply API/UI updates to `project_users.metadata` without allowing clients to
 * overwrite Grant-reserved `cdmImport` (always preserved from current row).
 */
export function mergeProjectUserMetadataApplyUpdate(
  current: Record<string, unknown>,
  incoming: Record<string, unknown>
): Record<string, unknown> {
  if (Object.prototype.hasOwnProperty.call(incoming, CDM_IMPORT_METADATA_KEY)) {
    throw new ValidationError(
      `Metadata must not include reserved top-level key "${CDM_IMPORT_METADATA_KEY}"`
    );
  }
  const merged = { ...current, ...incoming };
  if (Object.prototype.hasOwnProperty.call(current, CDM_IMPORT_METADATA_KEY)) {
    merged[CDM_IMPORT_METADATA_KEY] = current[CDM_IMPORT_METADATA_KEY];
  }
  return merged;
}

export function toMetadataRecord(raw: unknown): Record<string, unknown> {
  return normalizeMetadata(raw);
}

const PROJECT_METADATA_TENANTS: ReadonlySet<Tenant> = new Set([
  Tenant.AccountProject,
  Tenant.OrganizationProject,
  Tenant.AccountProjectUser,
  Tenant.OrganizationProjectUser,
]);

export function isProjectScopedUserMetadataTenant(tenant: Tenant): boolean {
  return PROJECT_METADATA_TENANTS.has(tenant);
}
