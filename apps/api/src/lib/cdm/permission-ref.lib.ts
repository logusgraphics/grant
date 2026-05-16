import type { CdmPermissionRefSpec } from '@grantjs/core';

import { NotFoundError, ValidationError } from '@/lib/errors';
import { Transaction } from '@/lib/transaction-manager.lib';
import {
  ProjectImportRepository,
  ResolvedCdmPermission,
} from '@/repositories/project-import.repository';

/**
 * Stable hashable key for a permission reference. Used to deduplicate refs
 * across all handlers and to cross-reference resolved permissions back to the
 * original input shape when applying.
 *
 * Lowercases slug/action so the key is canonical regardless of input casing.
 * `permissionKey` is included so refs that only differ by their CDM key are
 * not collapsed.
 */
export function refDedupKey(ref: CdmPermissionRefSpec): string {
  return JSON.stringify({
    s: (ref.resourceSlug ?? '').trim().toLowerCase(),
    a: (ref.action ?? '').trim().toLowerCase(),
    pk: ref.permissionKey ?? null,
    p: ref.permissionId ?? null,
    c: ref.condition ?? null,
  });
}

/** True when this ref can only be resolved at apply time via `produced.permissionIds`. */
export function isPermissionKeyOnlyRef(ref: CdmPermissionRefSpec): boolean {
  return (
    ref.permissionKey != null &&
    ref.permissionKey !== '' &&
    !ref.permissionId &&
    !ref.resourceSlug &&
    !ref.action
  );
}

/**
 * Resolve a single permission ref via the import repository, mapping repository
 * error codes to Grant's domain exceptions so the orchestrator can surface
 * actionable validation errors to the caller.
 *
 * Returns `null` when the ref can only be resolved at apply time via
 * `produced.permissionIds` (i.e. only `permissionKey` is set). The orchestrator
 * picks those up from cross-handler shared state in
 * {@link ProjectImportService.lookupRef} when each handler runs `apply`.
 */
export async function resolveSinglePermissionRef(
  importRepo: ProjectImportRepository,
  ref: CdmPermissionRefSpec,
  tx: Transaction
): Promise<ResolvedCdmPermission | null> {
  if (isPermissionKeyOnlyRef(ref)) {
    return null;
  }
  if (!ref.resourceSlug || !ref.action) {
    throw new ValidationError(
      'permissionRef must include resourceSlug + action, or permissionKey, or permissionId'
    );
  }
  const slug = ref.resourceSlug;
  const action = ref.action;
  try {
    return await importRepo.resolvePermission(
      {
        resourceSlug: slug,
        action,
        permissionId: ref.permissionId ?? null,
        condition: ref.condition ?? null,
      },
      tx
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === 'PERMISSION_NOT_FOUND') {
      throw new NotFoundError(
        `Permission not found for ${slug}:${action}${ref.permissionId ? ` (id ${ref.permissionId})` : ''}`
      );
    }
    if (msg === 'PERMISSION_REF_MISMATCH') {
      throw new ValidationError('permissionId does not match resourceSlug/action');
    }
    if (msg === 'PERMISSION_CONDITION_MISMATCH') {
      throw new ValidationError(`No permission matches ${slug}:${action} with the given condition`);
    }
    if (msg === 'PERMISSION_AMBIGUOUS') {
      throw new ValidationError(
        `Multiple permissions match ${slug}:${action}; disambiguate with permissionId or condition`
      );
    }
    throw e;
  }
}

/**
 * Resolve all unique permission refs in a single pass and return a map keyed
 * by `refDedupKey(...)`. Handlers consume the map via the apply context's
 * `lookupResolvedRef` closure.
 *
 * Refs that only carry a `permissionKey` are skipped here and resolved at
 * apply time against `produced.permissionIds`.
 */
export async function resolveAllPermissionRefs(
  importRepo: ProjectImportRepository,
  refs: readonly CdmPermissionRefSpec[],
  tx: Transaction
): Promise<Map<string, ResolvedCdmPermission>> {
  const resolved = new Map<string, ResolvedCdmPermission>();
  for (const ref of refs) {
    const key = refDedupKey(ref);
    if (resolved.has(key)) continue;
    const r = await resolveSinglePermissionRef(importRepo, ref, tx);
    if (r) resolved.set(key, r);
  }
  return resolved;
}
