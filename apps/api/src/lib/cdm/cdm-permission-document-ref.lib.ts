import type { CdmPermissionRefSpec } from '@grantjs/core';
import type { PermissionCdmInput } from '@grantjs/schema';

import { ValidationError } from '@/lib/errors';
import { normalizePermissionSlug } from '@/lib/permission-normalizer';

import type { CdmPermissionRefInternal } from './cdm-internal.types';
import { refDedupKey } from './permission-ref.lib';

/**
 * Serializes a handler/internal permission ref to a string stored on
 * `RoleCdmInput.permissions` / `UserCdmInput.permissions` in the public CDM document.
 *
 * - Opaque document keys (`permissionKey`) are emitted as-is when set.
 * - Otherwise catalog grants use `"{resourceSlug}:{action}"` with both segments
 *   normalized via {@link normalizePermissionSlug} (matches resolution / dedup).
 */
export function serializePermissionRefForCdmDocument(ref: CdmPermissionRefInternal): string | null {
  const pk = ref.permissionKey?.trim() ?? '';
  if (pk !== '') {
    return pk;
  }
  const slug = ref.resourceSlug?.trim() ?? '';
  const action = ref.action?.trim() ?? '';
  if (slug !== '' && action !== '') {
    return `${normalizePermissionSlug(slug)}:${normalizePermissionSlug(action)}`;
  }
  return null;
}

/**
 * Parses a public CDM permission string into an internal ref for expand/import.
 *
 * 1. If `s` matches a `permissions[].key` in the same document → `{ permissionKey }`.
 * 2. Else if `s` contains `:` → `{ resourceSlug, action }` (first colon splits slug vs action;
 *    resource slugs must not contain `:` in this encoding).
 */
export function parseCdmPermissionDocumentString(
  s: string,
  permissionByKey: ReadonlyMap<string, PermissionCdmInput>
): CdmPermissionRefInternal {
  const trimmed = s.trim();
  if (trimmed === '') {
    throw new ValidationError('permissions[]: empty permission reference string');
  }
  if (permissionByKey.has(trimmed)) {
    return {
      permissionKey: trimmed,
      resourceSlug: null,
      action: null,
      permissionId: null,
      condition: null,
    };
  }
  const colon = trimmed.indexOf(':');
  if (colon <= 0 || colon === trimmed.length - 1) {
    throw new ValidationError(
      `permissions[]: "${trimmed}" is neither a declared permission key nor a catalog ref "resourceSlug:action"`
    );
  }
  const rawSlug = trimmed.slice(0, colon).trim();
  const rawAction = trimmed.slice(colon + 1).trim();
  const resourceSlug = normalizePermissionSlug(rawSlug);
  const action = normalizePermissionSlug(rawAction);
  if (resourceSlug === '' || action === '') {
    throw new ValidationError(
      `permissions[]: invalid catalog ref "${trimmed}" (resource slug and action are required after ":")`
    );
  }
  return {
    permissionKey: null,
    resourceSlug,
    action,
    permissionId: null,
    condition: null,
  };
}

export function addPermissionRefDeduped(
  refs: CdmPermissionRefInternal[],
  ref: CdmPermissionRefInternal
): void {
  const key = refDedupKey(ref as CdmPermissionRefSpec);
  for (const existing of refs) {
    if (refDedupKey(existing as CdmPermissionRefSpec) === key) {
      return;
    }
  }
  refs.push(ref);
}

export function canonicalPermissionDocumentString(
  s: string,
  permissionByKey: ReadonlyMap<string, PermissionCdmInput>
): string {
  const ref = parseCdmPermissionDocumentString(s, permissionByKey);
  const out = serializePermissionRefForCdmDocument(ref);
  if (out == null || out === '') {
    throw new ValidationError(`permissions[]: could not canonicalize reference "${s}"`);
  }
  return out;
}
