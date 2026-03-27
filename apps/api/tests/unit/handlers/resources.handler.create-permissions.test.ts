import { Tenant } from '@grantjs/schema';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/i18n/config', () => ({
  defaultLocale: 'en',
  getFixedT: () => (key: string, opts: { action: string; resourceName: string }) => {
    if (key === 'common.permissions.createFromResourceDescription') {
      return `Permission to perform "${opts.action}" on ${opts.resourceName}.`;
    }
    return key;
  },
}));

import { ResourceHandler } from '@/handlers/resources.handler';

const mockTx = {};

const mockWithTransaction = vi.fn((fn: (tx: unknown) => Promise<unknown>) => fn(mockTx));

const mockResourceTags = {
  addResourceTag: vi.fn(),
  getResourceTags: vi.fn(),
  getResourceTagIntersection: vi.fn(),
};

const mockResources = {
  createResource: vi.fn(),
  validateSlugUniqueness: vi.fn().mockResolvedValue(undefined),
  getResources: vi.fn(),
  getResourceById: vi.fn(),
  updateResource: vi.fn(),
  deleteResource: vi.fn(),
};

const mockProjectResources = {
  addProjectResource: vi.fn().mockResolvedValue(undefined),
};

const mockPermissions = {
  createPermission: vi.fn(),
};

const mockPermissionTags = {};
const mockGroupPermissions = {};
const mockOrganizationPermissions = {};

const mockProjectPermissions = {
  addProjectPermission: vi.fn().mockResolvedValue(undefined),
};

const mockCache = {
  resources: { addIdToCache: vi.fn(), removeIdFromCache: vi.fn(), clear: vi.fn() },
  permissions: { addIdToCache: vi.fn(), removeIdFromCache: vi.fn(), clear: vi.fn() },
  groups: { addIdToCache: vi.fn(), removeIdFromCache: vi.fn(), clear: vi.fn() },
  roles: { addIdToCache: vi.fn(), removeIdFromCache: vi.fn(), clear: vi.fn() },
  users: { addIdToCache: vi.fn(), removeIdFromCache: vi.fn(), clear: vi.fn() },
  tags: { addIdToCache: vi.fn(), removeIdFromCache: vi.fn(), clear: vi.fn() },
  projects: { addIdToCache: vi.fn(), removeIdFromCache: vi.fn(), clear: vi.fn() },
  projectApps: { addIdToCache: vi.fn(), removeIdFromCache: vi.fn(), clear: vi.fn() },
  apiKeys: { addIdToCache: vi.fn(), removeIdFromCache: vi.fn(), clear: vi.fn() },
} as never;

const mockScopeServices = {
  accountProjects: {},
  organizationProjects: {},
  organizationRoles: {},
  projectRoles: {},
  userRoles: {},
  organizationUsers: {},
  projectUsers: {},
  organizationGroups: {},
  projectGroups: {},
  organizationPermissions: {},
  projectPermissions: {},
  projectResources: {},
  projectApps: {},
  accountTags: {},
  organizationTags: {},
  projectTags: {},
  projectUserApiKeys: {},
  accountProjectApiKeys: {},
  organizationProjectApiKeys: {},
} as never;

const mockDb = { withTransaction: mockWithTransaction };

function createHandler(): ResourceHandler {
  return new ResourceHandler(
    mockResourceTags as never,
    mockResources as never,
    mockProjectResources as never,
    mockPermissions as never,
    mockPermissionTags as never,
    mockGroupPermissions as never,
    mockOrganizationPermissions as never,
    mockProjectPermissions as never,
    mockCache,
    mockScopeServices,
    mockDb as never
  );
}

describe('ResourceHandler.createResource createPermissions', () => {
  const baseInput = {
    scope: {
      tenant: Tenant.OrganizationProject,
      id: 'org-id:project-id',
    },
    name: 'Documents',
    slug: 'documents',
    description: undefined as string | undefined,
    actions: ['read', 'write'] as string[],
    isActive: true,
    tagIds: undefined as string[] | undefined,
    primaryTagId: undefined as string | undefined,
  };

  const resourceRow = {
    id: 'res-1',
    name: 'Documents',
    slug: 'documents',
    description: null as string | null,
    actions: ['read', 'write', 'read'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null as Date | null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockResources.createResource.mockResolvedValue(resourceRow);
    mockPermissions.createPermission.mockImplementation(async ({ action }: { action: string }) => ({
      id: `perm-${action}`,
      name: `Documents: ${action}`,
      description: null,
      action,
      resourceId: 'res-1',
      resource: null,
      condition: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    }));
  });

  it('does not create permissions when createPermissions is false', async () => {
    const handler = createHandler();
    vi.spyOn(
      handler as never as { getScopedResourceIds: () => Promise<string[]> },
      'getScopedResourceIds'
    ).mockResolvedValue([]);
    vi.spyOn(
      handler as never as { addResourceIdToScopeCache: () => Promise<void> },
      'addResourceIdToScopeCache'
    ).mockResolvedValue();
    vi.spyOn(
      handler as never as { addPermissionIdToScopeCache: () => Promise<void> },
      'addPermissionIdToScopeCache'
    ).mockResolvedValue();

    await handler.createResource({
      input: { ...baseInput, createPermissions: false },
    });

    expect(mockPermissions.createPermission).not.toHaveBeenCalled();
    expect(mockProjectPermissions.addProjectPermission).not.toHaveBeenCalled();
  });

  it('creates one permission per unique action when createPermissions is true', async () => {
    const handler = createHandler();
    vi.spyOn(
      handler as never as { getScopedResourceIds: () => Promise<string[]> },
      'getScopedResourceIds'
    ).mockResolvedValue([]);
    vi.spyOn(
      handler as never as { addResourceIdToScopeCache: () => Promise<void> },
      'addResourceIdToScopeCache'
    ).mockResolvedValue();
    vi.spyOn(
      handler as never as { addPermissionIdToScopeCache: () => Promise<void> },
      'addPermissionIdToScopeCache'
    ).mockResolvedValue();

    await handler.createResource({
      input: { ...baseInput, createPermissions: true },
    });

    expect(mockPermissions.createPermission).toHaveBeenCalledTimes(2);
    expect(mockPermissions.createPermission).toHaveBeenCalledWith(
      expect.objectContaining({
        resourceId: 'res-1',
        action: 'read',
        condition: undefined,
      }),
      mockTx
    );
    expect(mockPermissions.createPermission).toHaveBeenCalledWith(
      expect.objectContaining({
        resourceId: 'res-1',
        action: 'write',
        condition: undefined,
      }),
      mockTx
    );
    expect(mockProjectPermissions.addProjectPermission).toHaveBeenCalledTimes(2);
    expect(mockProjectPermissions.addProjectPermission).toHaveBeenCalledWith(
      { projectId: 'project-id', permissionId: 'perm-read' },
      mockTx
    );
    expect(mockProjectPermissions.addProjectPermission).toHaveBeenCalledWith(
      { projectId: 'project-id', permissionId: 'perm-write' },
      mockTx
    );
  });
});
