import type {
  GroupCdmInput,
  PermissionCdmInput,
  ResourceCdmInput,
  RoleCdmInput,
  SyncProjectInput,
  TagCdmInput,
} from '@grantjs/schema';
import { CdmFindBy } from '@grantjs/schema';

import type {
  CdmProjectUserApiKeyInternal,
  CdmRoleTemplateInternal,
  CdmUserAssignmentInternal,
  CdmUserProvisionInternal,
} from './cdm-internal.types';
import {
  addPermissionRefDeduped,
  canonicalPermissionDocumentString,
  parseCdmPermissionDocumentString,
  serializePermissionRefForCdmDocument,
} from './cdm-permission-document-ref.lib';

/**
 * Handler pipeline input: canonical CDM document expanded into the slices
 * entity handlers expect (role templates, assignments, nested API keys, …).
 */
export interface ExpandedCdmSyncPayload {
  version: number;
  id: string | null;
  mode: SyncProjectInput['mode'];
  resources: ResourceCdmInput[];
  permissions: PermissionCdmInput[];
  tags: TagCdmInput[];
  groups: GroupCdmInput[];
  roleTemplates: CdmRoleTemplateInternal[];
  provisionedUsers: CdmUserProvisionInternal[];
  userAssignments: CdmUserAssignmentInternal[];
  projectUserApiKeys: CdmProjectUserApiKeyInternal[];
}

/**
 * Expand the ubiquitous CDM document into handler-owned slices.
 */
export function expandCdmSyncInput(input: SyncProjectInput): ExpandedCdmSyncPayload {
  const version = input.version;
  const id = input.id ?? null;
  const mode = input.mode;

  const permissionByKey = new Map<string, PermissionCdmInput>();
  for (const p of input.permissions ?? []) {
    const key = p.key?.trim() ?? '';
    if (key === '') continue;
    permissionByKey.set(key, { ...p });
  }
  const groupByKey = new Map((input.groups ?? []).map((g) => [g.key, g]));

  for (const g of input.groups ?? []) {
    for (const p of g.permissions ?? []) {
      if (!permissionByKey.has(p)) continue;
      const perm = permissionByKey.get(p)!;
      const prev = perm.groups ?? [];
      perm.groups = Array.from(new Set([...prev, g.key]));
    }
  }

  const roleTemplateByKey = new Map((input.roles ?? []).map((r) => [r.key, r]));

  const roleTemplates: CdmRoleTemplateInternal[] = (input.roles ?? []).map((role) => {
    const permissionRefs: CdmRoleTemplateInternal['permissionRefs'] = [];
    for (const p of role.permissions ?? []) {
      addPermissionRefDeduped(permissionRefs, parseCdmPermissionDocumentString(p, permissionByKey));
    }
    for (const gk of role.groups ?? []) {
      const g = groupByKey.get(gk);
      for (const gp of g?.permissions ?? []) {
        addPermissionRefDeduped(
          permissionRefs,
          parseCdmPermissionDocumentString(gp, permissionByKey)
        );
      }
      for (const [pk, p] of permissionByKey.entries()) {
        const groups = p.groups ?? [];
        if (groups.includes(gk)) {
          addPermissionRefDeduped(
            permissionRefs,
            parseCdmPermissionDocumentString(pk, permissionByKey)
          );
        }
      }
    }
    const linked = linkedGroupImportFields(role, groupByKey);
    return {
      externalKey: role.key,
      name: role.name,
      description: role.description ?? null,
      permissionRefs,
      metadata: role.metadata ?? null,
      tagKeys: role.tags ?? [],
      primaryRoleTagKey: role.primaryTag ?? null,
      groupTagKeys: linked.groupTagKeys,
      primaryGroupTagKey: linked.primaryGroupTagKey,
      linkedGroupImportName: linked.linkedGroupImportName,
      linkedGroupImportDescription: linked.linkedGroupImportDescription,
    };
  });

  const provisionedUsers: CdmUserProvisionInternal[] = [];
  const userAssignments: CdmUserAssignmentInternal[] = [];
  const projectUserApiKeys: CdmProjectUserApiKeyInternal[] = [];

  for (const u of input.users ?? []) {
    const resolver = u.key;
    const isId = resolver.findBy === CdmFindBy.Id;
    const userKey = !isId ? resolver.value : null;
    const userId = isId ? resolver.value : null;

    if (userKey) {
      provisionedUsers.push({
        externalKey: userKey,
        name: u.name,
        metadata: u.metadata ?? null,
      });
    }

    const requestedDirectPermissionKeys = (u.permissions ?? []).filter(
      (k): k is string => typeof k === 'string' && k.length > 0
    );
    const roleTemplateKeys = (u.roles ?? []).filter(
      (k): k is string => typeof k === 'string' && k.length > 0
    );
    for (const groupKey of (u.groups ?? []).filter(
      (k): k is string => typeof k === 'string' && k.length > 0
    )) {
      const syntheticRoleKey = `synthetic:role:user:${userKey ?? userId ?? 'unknown'}:${groupKey}`;
      if (!roleTemplateByKey.has(syntheticRoleKey)) {
        const refs: CdmRoleTemplateInternal['permissionRefs'] = [];
        const g = groupByKey.get(groupKey);
        for (const gp of g?.permissions ?? []) {
          if (typeof gp === 'string' && gp.length > 0) {
            addPermissionRefDeduped(refs, parseCdmPermissionDocumentString(gp, permissionByKey));
          }
        }
        for (const [pk, p] of permissionByKey.entries()) {
          const groups = p.groups ?? [];
          if (groups.includes(groupKey)) {
            addPermissionRefDeduped(refs, parseCdmPermissionDocumentString(pk, permissionByKey));
          }
        }
        roleTemplates.push({
          externalKey: syntheticRoleKey,
          name: syntheticRoleKey,
          description: 'Auto-generated role for user.groups normalization',
          permissionRefs: refs,
          metadata: { synthetic: true, sourceGroup: groupKey },
          tagKeys: [],
          primaryRoleTagKey: null,
          groupTagKeys: [],
          primaryGroupTagKey: null,
        });
      }
      roleTemplateKeys.push(syntheticRoleKey);
    }

    const impliedPermissionDocStrings = new Set<string>();
    for (const roleKey of roleTemplateKeys) {
      const role = roleTemplates.find((rt) => rt.externalKey === roleKey);
      if (!role) continue;
      for (const ref of role.permissionRefs ?? []) {
        const s = serializePermissionRefForCdmDocument(ref);
        if (s) impliedPermissionDocStrings.add(s);
      }
    }
    const missingDirectPermissionKeys = requestedDirectPermissionKeys.filter((key) => {
      const canon = canonicalPermissionDocumentString(key, permissionByKey);
      return !impliedPermissionDocStrings.has(canon);
    });
    const directRoleKey = `synthetic:role:user:${userKey ?? userId ?? 'unknown'}:direct`;
    if (
      missingDirectPermissionKeys.length > 0 &&
      !roleTemplates.some((r) => r.externalKey === directRoleKey)
    ) {
      const directRefs: CdmRoleTemplateInternal['permissionRefs'] = [];
      for (const k of missingDirectPermissionKeys) {
        addPermissionRefDeduped(directRefs, parseCdmPermissionDocumentString(k, permissionByKey));
      }
      roleTemplates.push({
        externalKey: directRoleKey,
        name: directRoleKey,
        description: 'Auto-generated role for unresolved user.permissions',
        permissionRefs: directRefs,
        metadata: { synthetic: true, source: 'user.permissions' },
        tagKeys: [],
        primaryRoleTagKey: null,
        groupTagKeys: [],
        primaryGroupTagKey: null,
      });
    }
    if (missingDirectPermissionKeys.length > 0) {
      roleTemplateKeys.push(directRoleKey);
    }

    userAssignments.push({
      userId,
      userKey,
      roleTemplateKeys,
      directPermissionRefs: [],
      tagKeys: u.tags ?? [],
      primaryUserTagKey: u.primaryTag ?? null,
      metadata: u.metadata ?? null,
    });

    for (const apiKey of u.apiKeys ?? []) {
      projectUserApiKeys.push({
        externalKey: apiKey.key ?? null,
        userId,
        userKey,
        clientId: apiKey.clientId ?? null,
        clientSecret: apiKey.clientSecret ?? null,
        name: apiKey.name ?? null,
        description: apiKey.description ?? null,
        expiresAt: apiKey.expiresAt ?? null,
        metadata: apiKey.metadata ?? null,
      });
    }
  }

  const resources: ResourceCdmInput[] = (input.resources ?? []).map((r) => ({
    ...r,
    slug: r.slug ?? slugify(r.name),
  }));

  const permissions: PermissionCdmInput[] = Array.from(permissionByKey.values()).map((p) => ({
    ...p,
    metadata: {
      ...(typeof p.metadata === 'object' && p.metadata != null ? p.metadata : {}),
      groups: p.groups ?? [],
      tags: p.tags ?? [],
      primaryTag: p.primaryTag ?? null,
    },
  }));

  const tags: TagCdmInput[] = (input.tags ?? []).map((t) => ({ ...t }));

  return {
    version,
    id,
    mode,
    resources,
    permissions,
    tags,
    groups: input.groups ?? [],
    roleTemplates,
    provisionedUsers,
    userAssignments,
    projectUserApiKeys,
  };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
}

function linkedGroupImportFields(
  role: RoleCdmInput,
  groupByKey: Map<string, GroupCdmInput>
): {
  groupTagKeys: string[];
  primaryGroupTagKey: string | null;
  linkedGroupImportName: string | null;
  linkedGroupImportDescription: string | null;
} {
  const groupKeys = (role.groups ?? []).filter(
    (k): k is string => typeof k === 'string' && k.length > 0
  );
  const tagKeySet = new Set<string>();
  let primaryGroupTagKey: string | null = null;
  let linkedGroupImportName: string | null = null;
  let linkedGroupImportDescription: string | null = null;

  for (let i = 0; i < groupKeys.length; i += 1) {
    const gk = groupKeys[i];
    const g = groupByKey.get(gk);
    if (!g) continue;
    for (const t of g.tags ?? []) {
      if (typeof t === 'string' && t.trim() !== '') tagKeySet.add(t.trim());
    }
    if (i === 0) {
      const n = g.name?.trim();
      linkedGroupImportName = n && n.length > 0 ? n : null;
      const d = g.description;
      linkedGroupImportDescription = typeof d === 'string' && d.trim() !== '' ? d.trim() : null;
      const pt = g.primaryTag;
      primaryGroupTagKey =
        typeof pt === 'string' && pt.trim() !== '' ? pt.trim() : primaryGroupTagKey;
    }
  }

  return {
    groupTagKeys: [...tagKeySet].sort(),
    primaryGroupTagKey,
    linkedGroupImportName,
    linkedGroupImportDescription,
  };
}
