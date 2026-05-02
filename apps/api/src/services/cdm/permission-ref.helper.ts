import type { CdmPermissionRefSpec } from '@grantjs/core';

import { NotFoundError, ValidationError } from '@/lib/errors';
import { Transaction } from '@/lib/transaction-manager.lib';
import {
  ProjectPermissionSyncRepository,
  ResolvedCdmPermission,
} from '@/repositories/project-permission-sync.repository';

/**
 * Stable hashable key for a permission reference. Used to deduplicate refs
 * across all handlers and to cross-reference resolved permissions back to the
 * original input shape when applying.
 *
 * Lowercases slug/action so the key is canonical regardless of input casing.
 */
export function refDedupKey(ref: CdmPermissionRefSpec): string {
  return JSON.stringify({
    s: ref.resourceSlug.trim().toLowerCase(),
    a: ref.action.trim().toLowerCase(),
    p: ref.permissionId ?? null,
    c: ref.condition ?? null,
  });
}

/**
 * Resolve a single permission ref via the sync repository, mapping repository
 * error codes to Grant's domain exceptions so the orchestrator can surface
 * actionable validation errors to the caller.
 */
export async function resolveSinglePermissionRef(
  syncRepo: ProjectPermissionSyncRepository,
  ref: CdmPermissionRefSpec,
  tx: Transaction
): Promise<ResolvedCdmPermission> {
  try {
    return await syncRepo.resolvePermission(
      {
        resourceSlug: ref.resourceSlug,
        action: ref.action,
        permissionId: ref.permissionId ?? null,
        condition: ref.condition ?? null,
      },
      tx
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === 'PERMISSION_NOT_FOUND') {
      throw new NotFoundError(
        `Permission not found for ${ref.resourceSlug}:${ref.action}${ref.permissionId ? ` (id ${ref.permissionId})` : ''}`
      );
    }
    if (msg === 'PERMISSION_REF_MISMATCH') {
      throw new ValidationError('permissionId does not match resourceSlug/action');
    }
    if (msg === 'PERMISSION_CONDITION_MISMATCH') {
      throw new ValidationError(
        `No permission matches ${ref.resourceSlug}:${ref.action} with the given condition`
      );
    }
    if (msg === 'PERMISSION_AMBIGUOUS') {
      throw new ValidationError(
        `Multiple permissions match ${ref.resourceSlug}:${ref.action}; disambiguate with permissionId or condition`
      );
    }
    throw e;
  }
}

/**
 * Resolve all unique permission refs in a single pass and return a map keyed
 * by `refDedupKey(...)`. Handlers consume the map via the apply context's
 * `lookupResolvedRef` closure.
 */
export async function resolveAllPermissionRefs(
  syncRepo: ProjectPermissionSyncRepository,
  refs: readonly CdmPermissionRefSpec[],
  tx: Transaction
): Promise<Map<string, ResolvedCdmPermission>> {
  const resolved = new Map<string, ResolvedCdmPermission>();
  for (const ref of refs) {
    const key = refDedupKey(ref);
    if (resolved.has(key)) continue;
    const r = await resolveSinglePermissionRef(syncRepo, ref, tx);
    resolved.set(key, r);
  }
  return resolved;
}
