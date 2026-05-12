import { CdmFindBy, CdmModeStrategy, type SyncProjectPermissionsInput } from '@grantjs/schema';
import { describe, expect, it } from 'vitest';

import { ValidationError } from '@/lib/errors';
import {
  canonicalPermissionDocumentString,
  parseCdmPermissionDocumentString,
  serializePermissionRefForCdmDocument,
} from '@/services/cdm/cdm-permission-document-ref';
import { expandCdmSyncInput } from '@/services/cdm/expand-cdm-sync-input';

const mode = {
  strategy: CdmModeStrategy.Merge,
  onConflict: null,
  confirmDestructive: false,
} as const;

describe('cdm-permission-document-ref', () => {
  const permissionByKey = new Map(
    Object.entries({
      'cdm-perm-a': {
        key: 'cdm-perm-a',
        resource: 'res',
        action: 'read',
        name: 'R',
        description: null,
        condition: null,
        groups: [],
        tags: [],
        primaryTag: null,
        metadata: null,
      },
    })
  );

  it('serialize emits permissionKey when set', () => {
    expect(
      serializePermissionRefForCdmDocument({
        permissionKey: 'cdm-perm-a',
        resourceSlug: 'x',
        action: 'y',
        permissionId: null,
        condition: null,
      })
    ).toBe('cdm-perm-a');
  });

  it('serialize emits normalized slug:action for catalog refs', () => {
    expect(
      serializePermissionRefForCdmDocument({
        permissionKey: null,
        resourceSlug: 'Document',
        action: 'Read',
        permissionId: null,
        condition: null,
      })
    ).toBe('document:read');
  });

  it('parse resolves document permission key first', () => {
    const ref = parseCdmPermissionDocumentString('cdm-perm-a', permissionByKey);
    expect(ref.permissionKey).toBe('cdm-perm-a');
    expect(ref.resourceSlug).toBeNull();
  });

  it('parse falls back to catalog slug:action', () => {
    const ref = parseCdmPermissionDocumentString('Foo:Bar', permissionByKey);
    expect(ref.permissionKey).toBeNull();
    expect(ref.resourceSlug).toBe('foo');
    expect(ref.action).toBe('bar');
  });

  it('parse rejects empty and invalid catalog strings', () => {
    expect(() => parseCdmPermissionDocumentString('   ', permissionByKey)).toThrow(ValidationError);
    expect(() => parseCdmPermissionDocumentString('nocolon', permissionByKey)).toThrow(
      ValidationError
    );
    expect(() => parseCdmPermissionDocumentString(':read', permissionByKey)).toThrow(
      ValidationError
    );
  });

  it('canonical round-trips catalog ref', () => {
    expect(canonicalPermissionDocumentString('DOC:query', permissionByKey)).toBe('doc:query');
  });
});

describe('expandCdmSyncInput catalog permission strings', () => {
  it('expands role.permissions catalog refs into internal slug+action refs', () => {
    const input: SyncProjectPermissionsInput = {
      version: 1,
      id: null,
      mode,
      roles: [
        {
          key: 'r1',
          name: 'R1',
          description: null,
          groups: [],
          permissions: ['document:read', 'document:query'],
          tags: [],
          primaryTag: null,
          metadata: null,
        },
      ],
      users: [],
      resources: [],
      permissions: [],
      groups: [],
      tags: [],
    };
    const expanded = expandCdmSyncInput(input);
    expect(expanded.roleTemplates).toHaveLength(1);
    const refs = expanded.roleTemplates[0]!.permissionRefs;
    expect(refs).toHaveLength(2);
    expect(refs[0]).toMatchObject({
      resourceSlug: 'document',
      action: 'read',
      permissionKey: null,
    });
    expect(refs[1]).toMatchObject({
      resourceSlug: 'document',
      action: 'query',
      permissionKey: null,
    });
  });

  it('expands document permission keys alongside catalog refs', () => {
    const input: SyncProjectPermissionsInput = {
      version: 1,
      id: null,
      mode,
      roles: [
        {
          key: 'r1',
          name: 'R1',
          description: null,
          groups: [],
          permissions: ['pk1', 'other:action'],
          tags: [],
          primaryTag: null,
          metadata: null,
        },
      ],
      users: [],
      resources: [],
      permissions: [
        {
          key: 'pk1',
          resource: 'res',
          action: 'read',
          name: 'N',
          description: null,
          condition: null,
          groups: [],
          tags: [],
          primaryTag: null,
          metadata: null,
        },
      ],
      groups: [],
      tags: [],
    };
    const expanded = expandCdmSyncInput(input);
    const refs = expanded.roleTemplates[0]!.permissionRefs;
    expect(refs).toHaveLength(2);
    const keys = refs.map((r) => serializePermissionRefForCdmDocument(r)).sort();
    expect(keys).toEqual(['other:action', 'pk1']);
  });

  it('dedupes equivalent catalog refs', () => {
    const input: SyncProjectPermissionsInput = {
      version: 1,
      id: null,
      mode,
      roles: [
        {
          key: 'r1',
          name: 'R1',
          description: null,
          groups: [],
          permissions: ['a:b', 'A:B'],
          tags: [],
          primaryTag: null,
          metadata: null,
        },
      ],
      users: [],
      resources: [],
      permissions: [],
      groups: [],
      tags: [],
    };
    const expanded = expandCdmSyncInput(input);
    expect(expanded.roleTemplates[0]!.permissionRefs).toHaveLength(1);
  });

  it('user.permissions direct synthetic role uses catalog strings', () => {
    const input: SyncProjectPermissionsInput = {
      version: 1,
      id: null,
      mode,
      roles: [],
      users: [
        {
          key: { value: 'u1', findBy: CdmFindBy.Key },
          name: 'U',
          roles: [],
          groups: [],
          permissions: ['z:extra'],
          tags: [],
          primaryTag: null,
          apiKeys: [],
          metadata: null,
        },
      ],
      resources: [],
      permissions: [],
      groups: [],
      tags: [],
    };
    const expanded = expandCdmSyncInput(input);
    const direct = expanded.roleTemplates.find((r) => r.externalKey.endsWith(':direct'));
    expect(direct).toBeDefined();
    expect(direct!.permissionRefs).toEqual([
      expect.objectContaining({ resourceSlug: 'z', action: 'extra', permissionKey: null }),
    ]);
  });
});

describe('expandCdmSyncInput role ↔ group document fields', () => {
  it('maps first linked group name/description and group tag keys onto roleTemplates', () => {
    const input: SyncProjectPermissionsInput = {
      version: 1,
      id: null,
      mode,
      roles: [
        {
          key: 'role-a',
          name: 'DocumentEditor',
          description: '',
          groups: ['grp-a'],
          permissions: ['document:read'],
          tags: ['tag-role'],
          primaryTag: 'tag-role',
          metadata: null,
        },
      ],
      users: [],
      resources: [
        {
          key: 'res-a',
          slug: 'document',
          name: 'Document',
          description: null,
          actions: ['read'],
          tags: [],
          primaryTag: null,
          metadata: null,
        },
      ],
      permissions: [
        {
          key: 'perm-a',
          resource: 'res-a',
          action: 'read',
          name: 'Doc read',
          description: null,
          condition: null,
          groups: [],
          tags: [],
          primaryTag: null,
          metadata: null,
        },
      ],
      groups: [
        {
          key: 'grp-a',
          name: 'DocumentFullAccess',
          description: 'G desc',
          permissions: ['perm-a'],
          tags: ['tag-g1', 'tag-g2'],
          primaryTag: 'tag-g1',
          metadata: null,
        },
      ],
      tags: [
        { key: 'tag-role', name: 'R', color: 'red', metadata: null },
        { key: 'tag-g1', name: 'G1', color: 'blue', metadata: null },
        { key: 'tag-g2', name: 'G2', color: 'green', metadata: null },
      ],
    };
    const expanded = expandCdmSyncInput(input);
    const rt = expanded.roleTemplates.find((r) => r.externalKey === 'role-a');
    expect(rt).toBeDefined();
    expect(rt!.linkedGroupImportName).toBe('DocumentFullAccess');
    expect(rt!.linkedGroupImportDescription).toBe('G desc');
    expect(rt!.groupTagKeys).toEqual(['tag-g1', 'tag-g2']);
    expect(rt!.primaryGroupTagKey).toBe('tag-g1');
    expect(rt!.tagKeys).toEqual(['tag-role']);
    expect(rt!.primaryRoleTagKey).toBe('tag-role');
  });
});
