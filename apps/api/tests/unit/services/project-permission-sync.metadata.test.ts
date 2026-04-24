import { type Scope, type SyncProjectPermissionsInput, Tenant } from '@grantjs/schema';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CDM_IMPORT_METADATA_KEY, CDM_SOURCE_METADATA_KEY } from '@/constants/cdm-import.constants';
import { ProjectPermissionSyncService } from '@/services/project-permission-sync.service';

const accountId = '10000000-0000-4000-8000-000000000020';
const projectId = '10000000-0000-4000-8000-000000000011';
const scope: Scope = { tenant: Tenant.AccountProject, id: `${accountId}:${projectId}` };

describe('ProjectPermissionSyncService CDM metadata', () => {
  const syncRepo = {
    listCdmRoleIdsForProject: vi.fn().mockResolvedValue([]),
    listCdmGroupIdsForProject: vi.fn().mockResolvedValue([]),
    resolvePermission: vi.fn().mockResolvedValue({ id: 'perm-1', resourceId: 'res-1' }),
  };
  const roles = { createRole: vi.fn(), deleteRole: vi.fn() };
  const groups = { createGroup: vi.fn(), deleteGroup: vi.fn() };
  const roleGroups = {
    getRoleGroups: vi.fn().mockResolvedValue([]),
    addRoleGroup: vi.fn(),
    removeRoleGroup: vi.fn(),
  };
  const groupPermissions = {
    getGroupPermissions: vi.fn().mockResolvedValue([]),
    addGroupPermission: vi.fn(),
    removeGroupPermission: vi.fn(),
  };
  const projectRoles = { addProjectRole: vi.fn(), removeProjectRole: vi.fn() };
  const projectGroups = { addProjectGroup: vi.fn(), removeProjectGroup: vi.fn() };
  const projectPermissions = {
    getProjectPermissions: vi.fn().mockResolvedValue([]),
    addProjectPermission: vi.fn(),
  };
  const projectResources = {
    getProjectResources: vi.fn().mockResolvedValue([]),
    addProjectResource: vi.fn(),
  };
  const projectUsers = {
    addProjectUser: vi.fn(),
    mergeProjectUserCdmMetadata: vi.fn(),
  };
  const userRoles = { addUserRole: vi.fn(), removeUserRole: vi.fn(), getUserRoles: vi.fn() };

  function createService() {
    return new ProjectPermissionSyncService(
      syncRepo as never,
      roles as never,
      groups as never,
      roleGroups as never,
      groupPermissions as never,
      projectRoles as never,
      projectGroups as never,
      projectPermissions as never,
      projectResources as never,
      projectUsers as never,
      userRoles as never
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    groups.createGroup.mockResolvedValue({ id: 'group-1' });
    roles.createRole.mockResolvedValue({ id: 'role-1' });
    roleGroups.addRoleGroup.mockResolvedValue({});
    projectGroups.addProjectGroup.mockResolvedValue({});
    projectRoles.addProjectRole.mockResolvedValue({});
    groupPermissions.addGroupPermission.mockResolvedValue({});
    projectPermissions.addProjectPermission.mockResolvedValue({});
    projectResources.addProjectResource.mockResolvedValue({});
    projectUsers.addProjectUser.mockResolvedValue({});
    userRoles.addUserRole.mockResolvedValue({});
  });

  it('merges template metadata into role and group create payloads', async () => {
    const input: SyncProjectPermissionsInput = {
      cdmVersion: 1,
      roleTemplates: [
        {
          externalKey: 'viewer',
          name: 'Viewer',
          permissionRefs: [{ resourceSlug: 'Tag', action: 'Query' }],
          metadata: { legacyRoleId: 'r-9' },
        },
      ],
      userAssignments: [],
    };

    const svc = createService();
    await svc.syncProjectPermissions({ projectId, scope, input }, {});

    expect(groups.createGroup).toHaveBeenCalledTimes(1);
    const groupMeta = groups.createGroup.mock.calls[0][0].metadata as Record<string, unknown>;
    expect(groupMeta[CDM_IMPORT_METADATA_KEY]).toMatchObject({
      projectId,
      kind: 'group',
      externalKey: 'viewer',
    });
    expect(groupMeta[CDM_SOURCE_METADATA_KEY]).toEqual({ legacyRoleId: 'r-9' });

    expect(roles.createRole).toHaveBeenCalledTimes(1);
    const roleMeta = roles.createRole.mock.calls[0][0].metadata as Record<string, unknown>;
    expect(roleMeta[CDM_IMPORT_METADATA_KEY]).toMatchObject({
      projectId,
      kind: 'role',
      externalKey: 'viewer',
    });
    expect(roleMeta[CDM_SOURCE_METADATA_KEY]).toEqual({ legacyRoleId: 'r-9' });
  });

  it('calls mergeProjectUserCdmMetadata when user assignment includes metadata', async () => {
    const userId = '20000000-0000-4000-8000-000000000033';
    const input: SyncProjectPermissionsInput = {
      cdmVersion: 1,
      roleTemplates: [
        {
          externalKey: 'viewer',
          name: 'Viewer',
          permissionRefs: [{ resourceSlug: 'Tag', action: 'Query' }],
        },
      ],
      userAssignments: [
        {
          userId,
          roleTemplateKeys: ['viewer'],
          metadata: { legacyUserId: 'u-1' },
        },
      ],
    };

    const svc = createService();
    await svc.syncProjectPermissions({ projectId, scope, input }, {});

    expect(projectUsers.mergeProjectUserCdmMetadata).toHaveBeenCalledWith(
      {
        projectId,
        userId,
        importerMetadata: { legacyUserId: 'u-1' },
      },
      {}
    );
  });
});
