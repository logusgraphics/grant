import type { CdmPermissionRefSpec } from '@grantjs/core';
import { describe, expect, it, vi } from 'vitest';

import {
  isPermissionKeyOnlyRef,
  refDedupKey,
  resolveAllPermissionRefs,
  resolveSinglePermissionRef,
} from '@/lib/cdm/permission-ref.lib';

describe('refDedupKey', () => {
  it('canonicalises slug/action casing and whitespace', () => {
    const a: CdmPermissionRefSpec = { resourceSlug: 'Documents', action: 'READ' };
    const b: CdmPermissionRefSpec = { resourceSlug: '  documents  ', action: 'read' };
    expect(refDedupKey(a)).toBe(refDedupKey(b));
  });

  it('produces distinct keys when permissionKey differs', () => {
    const a: CdmPermissionRefSpec = { permissionKey: 'pk1' };
    const b: CdmPermissionRefSpec = { permissionKey: 'pk2' };
    expect(refDedupKey(a)).not.toBe(refDedupKey(b));
  });

  it('produces distinct keys for permissionKey vs slug+action even when slug+action are unset', () => {
    const a: CdmPermissionRefSpec = { permissionKey: 'pk1' };
    const b: CdmPermissionRefSpec = { resourceSlug: 'documents', action: 'read' };
    expect(refDedupKey(a)).not.toBe(refDedupKey(b));
  });
});

describe('isPermissionKeyOnlyRef', () => {
  it('returns true for permissionKey-only refs', () => {
    expect(isPermissionKeyOnlyRef({ permissionKey: 'pk1' })).toBe(true);
  });

  it('returns false when slug/action/permissionId are also set', () => {
    expect(
      isPermissionKeyOnlyRef({ permissionKey: 'pk1', resourceSlug: 'documents', action: 'read' })
    ).toBe(false);
    expect(isPermissionKeyOnlyRef({ permissionKey: 'pk1', permissionId: 'abc' })).toBe(false);
  });

  it('returns false when permissionKey is missing or empty', () => {
    expect(isPermissionKeyOnlyRef({ resourceSlug: 'documents', action: 'read' })).toBe(false);
    expect(isPermissionKeyOnlyRef({ permissionKey: '' })).toBe(false);
  });
});

describe('resolveSinglePermissionRef', () => {
  it('returns null for permissionKey-only refs (deferred to apply time)', async () => {
    const importRepo = { resolvePermission: vi.fn() };
    const out = await resolveSinglePermissionRef(
      importRepo as never,
      { permissionKey: 'pk1' },
      {} as never
    );
    expect(out).toBeNull();
    expect(importRepo.resolvePermission).not.toHaveBeenCalled();
  });

  it('throws ValidationError when neither permissionKey nor slug+action is provided', async () => {
    const importRepo = { resolvePermission: vi.fn() };
    await expect(
      resolveSinglePermissionRef(importRepo as never, { permissionId: 'abc' }, {} as never)
    ).rejects.toThrow(/must include resourceSlug \+ action, or permissionKey, or permissionId/);
  });

  it('delegates to importRepo.resolvePermission for slug+action refs', async () => {
    const resolved = { permissionId: 'p1', resourceId: 'r1', resourceSlug: 'documents' };
    const resolvePermission = vi.fn().mockResolvedValue(resolved);
    const out = await resolveSinglePermissionRef(
      { resolvePermission } as never,
      { resourceSlug: 'documents', action: 'read' },
      { __tx: true } as never
    );
    expect(out).toBe(resolved);
    expect(resolvePermission).toHaveBeenCalledWith(
      expect.objectContaining({ resourceSlug: 'documents', action: 'read' }),
      { __tx: true }
    );
  });

  it('maps PERMISSION_NOT_FOUND to NotFoundError with a descriptive message', async () => {
    const resolvePermission = vi.fn().mockRejectedValue(new Error('PERMISSION_NOT_FOUND'));
    await expect(
      resolveSinglePermissionRef(
        { resolvePermission } as never,
        { resourceSlug: 'documents', action: 'read' },
        {} as never
      )
    ).rejects.toThrow(/Permission not found for documents:read/);
  });

  it('maps PERMISSION_AMBIGUOUS to a ValidationError prompting disambiguation', async () => {
    const resolvePermission = vi.fn().mockRejectedValue(new Error('PERMISSION_AMBIGUOUS'));
    await expect(
      resolveSinglePermissionRef(
        { resolvePermission } as never,
        { resourceSlug: 'documents', action: 'read' },
        {} as never
      )
    ).rejects.toThrow(/Multiple permissions match documents:read/);
  });
});

describe('resolveAllPermissionRefs', () => {
  it('skips permissionKey-only refs and dedupes the rest by canonical key', async () => {
    const resolvePermission = vi.fn().mockResolvedValue({
      permissionId: 'p1',
      resourceId: 'r1',
      resourceSlug: 'documents',
    });
    const refs: CdmPermissionRefSpec[] = [
      { permissionKey: 'pk1' },
      { resourceSlug: 'documents', action: 'read' },
      { resourceSlug: 'Documents', action: 'READ' },
    ];

    const out = await resolveAllPermissionRefs({ resolvePermission } as never, refs, {} as never);

    expect(resolvePermission).toHaveBeenCalledTimes(1);
    expect(out.size).toBe(1);
  });
});
