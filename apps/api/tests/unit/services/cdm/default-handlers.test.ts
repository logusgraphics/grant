/**
 * Pins the default CDM handler registry order.
 *
 * Order matters: tags must run before roleTemplates and userAssignments so the
 * `produced.tagIds` map is populated when those handlers resolve `tagKeys` /
 * `groupTagKeys`. ProjectUserApiKey runs last because it depends on both
 * roleTemplates (project_users via userAssignments handler) and userAssignments
 * (assignmentUserIds gate).
 */
import { describe, expect, it, vi } from 'vitest';

import { CdmHandlerRegistryDeps, createDefaultCdmHandlers } from '@/services/cdm';

function buildDeps(): CdmHandlerRegistryDeps {
  const stub = vi.fn();
  return {
    syncRepo: stub as never,
    exportRepo: stub as never,
    roles: stub as never,
    groups: stub as never,
    roleGroups: stub as never,
    groupPermissions: stub as never,
    projectRoles: stub as never,
    projectGroups: stub as never,
    projectPermissions: stub as never,
    projectResources: stub as never,
    projectUsers: stub as never,
    userRoles: stub as never,
    apiKeys: stub as never,
    projectUserApiKeys: stub as never,
    tags: stub as never,
    projectTags: stub as never,
    roleTags: stub as never,
    groupTags: stub as never,
    userTags: stub as never,
  };
}

describe('createDefaultCdmHandlers', () => {
  it('registers tag(5), roleTemplate(10), userAssignment(20), projectUserApiKey(300) in ascending order', () => {
    const handlers = createDefaultCdmHandlers(buildDeps());
    const orders = handlers.map((h) => ({ kind: h.handlerKind, order: h.order }));
    expect(orders).toEqual([
      { kind: 'tag', order: 5 },
      { kind: 'roleTemplate', order: 10 },
      { kind: 'userAssignment', order: 20 },
      { kind: 'projectUserApiKey', order: 300 },
    ]);
  });

  it('returns a frozen array (registry is immutable mid-pipeline)', () => {
    const handlers = createDefaultCdmHandlers(buildDeps());
    expect(Object.isFrozen(handlers)).toBe(true);
  });

  it('each handler maps to its corresponding SyncProjectPermissionsInput field', () => {
    const handlers = createDefaultCdmHandlers(buildDeps());
    const byKind = Object.fromEntries(handlers.map((h) => [h.handlerKind, h.inputKey]));
    expect(byKind).toEqual({
      tag: 'tags',
      roleTemplate: 'roleTemplates',
      userAssignment: 'userAssignments',
      projectUserApiKey: 'projectUserApiKeys',
    });
  });
});
