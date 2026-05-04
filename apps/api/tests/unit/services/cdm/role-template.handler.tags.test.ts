/**
 * Focused unit tests for the tag-wiring slice of the RoleTemplateHandler.
 *
 * Asserts that:
 *   - apply() reads `produced.tagIds` to attach role_tags + group_tags,
 *     incrementing the new counters.
 *   - apply() throws `ValidationError` when a tagKey is unknown.
 *   - export() projects role_tags and group_tags back to the CDM input shape.
 */
import type { CdmApplyContext, CdmExportContext } from '@grantjs/core';
import { Scope, SyncProjectPermissionsResult, Tenant } from '@grantjs/schema';
import { describe, expect, it, vi } from 'vitest';

import { RoleTemplateHandler } from '@/services/cdm/role-template.handler';

const projectId = '10000000-0000-4000-8000-000000000011';
const accountId = '20000000-0000-4000-8000-000000000020';
const scope: Scope = { tenant: Tenant.AccountProject, id: `${accountId}:${projectId}` };

function baseResult(): SyncProjectPermissionsResult {
  return {
    projectId,
    importId: null,
    rolesCreated: 0,
    groupsCreated: 0,
    roleGroupsLinked: 0,
    groupPermissionsLinked: 0,
    projectRolesLinked: 0,
    projectGroupsLinked: 0,
    projectPermissionsLinked: 0,
    projectResourcesLinked: 0,
    projectUsersEnsured: 0,
    userRolesAssigned: 0,
    projectUserApiKeysCreated: 0,
    tagsCreated: 0,
    projectTagsLinked: 0,
    roleTagsLinked: 0,
    groupTagsLinked: 0,
    userTagsLinked: 0,
    warnings: [],
  };
}

function buildHandler(deps?: {
  roleTags?: { addRoleTag: ReturnType<typeof vi.fn> };
  groupTags?: { addGroupTag: ReturnType<typeof vi.fn> };
  builderCounts?: { roleId: string; groupId: string };
  exportRepo?: {
    getProjectRolesWithPermissions: ReturnType<typeof vi.fn>;
    getRoleTagsByRoleIds: ReturnType<typeof vi.fn>;
    getGroupTagsByGroupIds: ReturnType<typeof vi.fn>;
    getCdmGroupIdsForRoleIds: ReturnType<typeof vi.fn>;
  };
}) {
  const roleTags = deps?.roleTags ?? { addRoleTag: vi.fn().mockResolvedValue(undefined) };
  const groupTags = deps?.groupTags ?? { addGroupTag: vi.fn().mockResolvedValue(undefined) };
  const counts = deps?.builderCounts ?? {
    roleId: '70000000-0000-4000-8000-000000000001',
    groupId: '70000000-0000-4000-8000-000000000002',
  };
  const builder = {
    createRoleWithGroup: vi.fn().mockResolvedValue({
      roleId: counts.roleId,
      groupId: counts.groupId,
      counts: {
        roleGroups: 1,
        groupPermissions: 1,
        projectRoles: 1,
        projectGroups: 1,
        projectPermissions: 1,
        projectResources: 1,
      },
    }),
  };
  const exportRepo = deps?.exportRepo ?? {
    getProjectRolesWithPermissions: vi.fn().mockResolvedValue([]),
    getRoleTagsByRoleIds: vi.fn().mockResolvedValue([]),
    getGroupTagsByGroupIds: vi.fn().mockResolvedValue([]),
    getCdmGroupIdsForRoleIds: vi.fn().mockResolvedValue(new Map()),
  };
  return {
    handler: new RoleTemplateHandler(
      {} as never,
      exportRepo as never,
      builder as never,
      roleTags as never,
      groupTags as never
    ),
    builder,
    roleTags,
    groupTags,
    exportRepo,
    counts,
  };
}

describe('RoleTemplateHandler — tag wiring', () => {
  it('validateInput rejects duplicate tagKeys / groupTagKeys', () => {
    const { handler } = buildHandler();
    expect(() =>
      handler.validateInput([
        {
          externalKey: 'r1',
          name: 'R',
          permissionRefs: [{ resourceSlug: 'Tag', action: 'Query' }],
          tagKeys: ['t', 't'],
        },
      ])
    ).toThrow(/tagKeys: duplicate value 't'/);

    expect(() =>
      handler.validateInput([
        {
          externalKey: 'r1',
          name: 'R',
          permissionRefs: [{ resourceSlug: 'Tag', action: 'Query' }],
          groupTagKeys: ['g', 'g'],
        },
      ])
    ).toThrow(/groupTagKeys: duplicate value 'g'/);
  });

  it('apply attaches role_tags + group_tags from produced.tagIds and bumps counters', async () => {
    const { handler, roleTags, groupTags, counts } = buildHandler();
    const result = baseResult();
    const tagIds = new Map<string, string>([
      ['t1', '60000000-0000-4000-8000-000000000aaa'],
      ['t2', '60000000-0000-4000-8000-000000000bbb'],
      ['g1', '60000000-0000-4000-8000-000000000ccc'],
    ]);
    const ctx: CdmApplyContext = {
      projectId,
      scope,
      tx: { __tx: true },
      lookupResolvedRef: () => ({ id: 'p', resourceId: 'r' }),
      result,
      produced: { roleTemplateIds: new Map(), tagIds },
      assignmentUserIds: new Set<string>(),
    };

    await handler.apply(ctx, [
      {
        externalKey: 'role-1',
        name: 'Role 1',
        permissionRefs: [{ resourceSlug: 'Tag', action: 'Query' }],
        tagKeys: ['t1', 't2'],
        groupTagKeys: ['g1'],
      },
    ]);

    expect(roleTags.addRoleTag).toHaveBeenCalledTimes(2);
    expect(roleTags.addRoleTag).toHaveBeenNthCalledWith(
      1,
      { roleId: counts.roleId, tagId: tagIds.get('t1'), isPrimary: false },
      ctx.tx
    );
    expect(roleTags.addRoleTag).toHaveBeenNthCalledWith(
      2,
      { roleId: counts.roleId, tagId: tagIds.get('t2'), isPrimary: false },
      ctx.tx
    );
    expect(groupTags.addGroupTag).toHaveBeenCalledWith(
      { groupId: counts.groupId, tagId: tagIds.get('g1'), isPrimary: false },
      ctx.tx
    );
    expect(result.roleTagsLinked).toBe(2);
    expect(result.groupTagsLinked).toBe(1);
  });

  it('apply throws ValidationError for unknown tagKey / groupTagKey', async () => {
    const { handler } = buildHandler();
    const ctx: CdmApplyContext = {
      projectId,
      scope,
      tx: { __tx: true },
      lookupResolvedRef: () => ({ id: 'p', resourceId: 'r' }),
      result: baseResult(),
      produced: { roleTemplateIds: new Map(), tagIds: new Map() },
      assignmentUserIds: new Set<string>(),
    };

    await expect(
      handler.apply(ctx, [
        {
          externalKey: 'r1',
          name: 'R',
          permissionRefs: [{ resourceSlug: 'Tag', action: 'Query' }],
          tagKeys: ['unknown'],
        },
      ])
    ).rejects.toThrow(/unknown tagKey 'unknown'/);
  });

  it('export projects role_tags and group_tags into tagKeys/groupTagKeys', async () => {
    const roleId = '70000000-0000-4000-8000-000000000777';
    const groupId = '70000000-0000-4000-8000-000000000888';
    const tagA = '60000000-0000-4000-8000-000000000aaa';
    const tagB = '60000000-0000-4000-8000-000000000bbb';
    const tagG = '60000000-0000-4000-8000-000000000ccc';

    const { handler, exportRepo } = buildHandler({
      exportRepo: {
        getProjectRolesWithPermissions: vi.fn().mockResolvedValue([
          {
            roleId,
            name: 'CDM: Viewer',
            description: 'desc',
            permissions: [
              {
                resourceSlug: 'Tag',
                action: 'Query',
                permissionId: 'p1',
                condition: null,
              },
            ],
            metadata: {},
          },
        ]),
        getRoleTagsByRoleIds: vi.fn().mockResolvedValue([
          { ownerId: roleId, tagId: tagB },
          { ownerId: roleId, tagId: tagA },
        ]),
        getGroupTagsByGroupIds: vi.fn().mockResolvedValue([{ ownerId: groupId, tagId: tagG }]),
        getCdmGroupIdsForRoleIds: vi.fn().mockResolvedValue(new Map([[roleId, groupId]])),
      },
    });

    const ctx: CdmExportContext = { projectId, scope };
    const out = await handler.export(ctx);

    expect(exportRepo.getProjectRolesWithPermissions).toHaveBeenCalled();
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual(
      expect.objectContaining({
        externalKey: roleId,
        name: 'Viewer',
        tagKeys: [tagA, tagB],
        groupTagKeys: [tagG],
      })
    );
  });

  it('export omits tagKeys / groupTagKeys when empty', async () => {
    const roleId = '70000000-0000-4000-8000-000000000777';
    const groupId = '70000000-0000-4000-8000-000000000888';
    const { handler } = buildHandler({
      exportRepo: {
        getProjectRolesWithPermissions: vi.fn().mockResolvedValue([
          {
            roleId,
            name: 'Viewer',
            description: null,
            permissions: [
              {
                resourceSlug: 'Tag',
                action: 'Query',
                permissionId: 'p1',
                condition: null,
              },
            ],
            metadata: {},
          },
        ]),
        getRoleTagsByRoleIds: vi.fn().mockResolvedValue([]),
        getGroupTagsByGroupIds: vi.fn().mockResolvedValue([]),
        getCdmGroupIdsForRoleIds: vi.fn().mockResolvedValue(new Map([[roleId, groupId]])),
      },
    });

    const out = await handler.export({ projectId, scope });

    expect(out[0].tagKeys).toBeUndefined();
    expect(out[0].groupTagKeys).toBeUndefined();
  });
});
