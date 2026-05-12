import {
  CdmFindBy,
  CdmModeStrategy,
  type Scope,
  type SyncProjectPermissionsInput,
  Tenant,
} from '@grantjs/schema';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CDM_IMPORT_METADATA_KEY, CDM_SOURCE_METADATA_KEY } from '@/constants/cdm-import.constants';
import { ProjectPermissionSyncService } from '@/services/project-permission-sync.service';

const accountId = '10000000-0000-4000-8000-000000000020';
const projectId = '10000000-0000-4000-8000-000000000011';
const scope: Scope = { tenant: Tenant.AccountProject, id: `${accountId}:${projectId}` };

/** Opaque keys so expand → roleTemplates get at least one permissionRef (RoleTemplateHandler.validateInput). */
const CDM_RES_KEY = 'cdm-res-metadata';
const CDM_PERM_KEY = 'cdm-perm-metadata';

describe('ProjectPermissionSyncService CDM metadata', () => {
  const syncRepo = {
    listCdmRoleIdsForProject: vi.fn().mockResolvedValue([]),
    listCdmGroupIdsForProject: vi.fn().mockResolvedValue([]),
    listCdmProjectUserApiKeyIdsForProject: vi.fn().mockResolvedValue([]),
    listCdmTagIdsForProject: vi.fn().mockResolvedValue([]),
    bulkSoftDeleteCdmTags: vi.fn().mockResolvedValue(undefined),
    listCdmResourceIdsForProject: vi.fn().mockResolvedValue([]),
    bulkSoftDeleteCdmResources: vi.fn().mockResolvedValue(undefined),
    listCdmPermissionIdsForProject: vi.fn().mockResolvedValue([]),
    bulkSoftDeleteCdmPermissions: vi.fn().mockResolvedValue(undefined),
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
  const apiKeys = {
    deleteApiKey: vi.fn(),
    createApiKeyForCdmImport: vi.fn(),
  };
  const projectUserApiKeys = { addProjectUserApiKey: vi.fn() };

  const cache = {
    permissions: { delete: vi.fn(), keys: vi.fn().mockResolvedValue([]) },
    roles: { delete: vi.fn() },
    groups: { delete: vi.fn() },
    users: { delete: vi.fn() },
    resources: { delete: vi.fn() },
    tags: { delete: vi.fn() },
    apiKeys: { delete: vi.fn() },
  };

  const tags = { createTag: vi.fn() };
  const projectTags = { addProjectTag: vi.fn() };
  const roleTags = { addRoleTag: vi.fn() };
  const groupTags = { addGroupTag: vi.fn() };
  const userTags = { addUserTag: vi.fn() };
  const resourcesService = { createResource: vi.fn() };
  const permissionsService = { createPermission: vi.fn() };
  const resourceTags = { addResourceTag: vi.fn() };
  const permissionTags = { addPermissionTag: vi.fn() };

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
      userRoles as never,
      apiKeys as never,
      projectUserApiKeys as never,
      cache as never,
      tags as never,
      projectTags as never,
      roleTags as never,
      groupTags as never,
      userTags as never,
      resourcesService as never,
      permissionsService as never,
      {} as never,
      {} as never,
      resourceTags as never,
      permissionTags as never
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    groups.createGroup.mockResolvedValue({ id: 'group-1' });
    roles.createRole.mockResolvedValue({ id: 'role-1' });
    resourcesService.createResource.mockResolvedValue({ id: 'imported-res-1', slug: 'documents' });
    permissionsService.createPermission.mockResolvedValue({ id: 'imported-perm-1' });
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
      version: 1,
      id: null,
      mode: {
        strategy: CdmModeStrategy.Merge,
        onConflict: null,
        confirmDestructive: false,
      },
      roles: [
        {
          key: 'viewer',
          name: 'Viewer',
          permissions: [CDM_PERM_KEY],
          groups: [],
          tags: [],
          primaryTag: null,
          metadata: { legacyRoleId: 'r-9' },
        },
      ],
      users: [],
      resources: [
        {
          key: CDM_RES_KEY,
          slug: 'documents',
          name: 'Documents',
          description: null,
          actions: ['read'],
          tags: [],
          primaryTag: null,
          metadata: null,
        },
      ],
      permissions: [
        {
          key: CDM_PERM_KEY,
          resource: CDM_RES_KEY,
          action: 'read',
          name: 'Documents:read',
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
      version: 1,
      id: null,
      mode: {
        strategy: CdmModeStrategy.Merge,
        onConflict: null,
        confirmDestructive: false,
      },
      roles: [
        {
          key: 'viewer',
          name: 'Viewer',
          permissions: [CDM_PERM_KEY],
          groups: [],
          tags: [],
          primaryTag: null,
          metadata: null,
        },
      ],
      users: [
        {
          key: { value: userId, findBy: CdmFindBy.Id },
          name: 'Member',
          roles: ['viewer'],
          groups: [],
          permissions: [],
          tags: [],
          primaryTag: null,
          apiKeys: [],
          metadata: { legacyUserId: 'u-1' },
        },
      ],
      resources: [
        {
          key: CDM_RES_KEY,
          slug: 'documents',
          name: 'Documents',
          description: null,
          actions: ['read'],
          tags: [],
          primaryTag: null,
          metadata: null,
        },
      ],
      permissions: [
        {
          key: CDM_PERM_KEY,
          resource: CDM_RES_KEY,
          action: 'read',
          name: 'Documents:read',
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

  it('invalidateCachesForSyncResult clears scoped entity caches including tags and API keys', async () => {
    const expectedKey = `${scope.tenant}:${scope.id}`;
    const svc = createService();
    await svc.invalidateCachesForSyncResult({ scope, userIds: [] });

    expect(cache.permissions.delete).toHaveBeenCalledWith(expectedKey);
    expect(cache.tags.delete).toHaveBeenCalledWith(expectedKey);
    expect(cache.apiKeys.delete).toHaveBeenCalledWith(expectedKey);
  });
});
