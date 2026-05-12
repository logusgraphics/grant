/**
 * Unit tests for ProjectPermissionExportService.
 *
 * Mocks handlers to pin orchestration: canonical `SyncProjectPermissionsInput`
 * is assembled from internal handler slices (`roleTemplates`, `userAssignments`, …).
 */
import type {
  CdmExportContext,
  CdmHandlerInputKey,
  CdmPermissionRefSpec,
  ICdmEntityHandler,
} from '@grantjs/core';
import { CdmFindBy, type Scope, Tenant } from '@grantjs/schema';
import { describe, expect, it, vi } from 'vitest';

import { ProjectPermissionExportService } from '@/services/project-permission-export.service';

const accountId = '10000000-0000-4000-8000-000000000020';
const projectId = '10000000-0000-4000-8000-000000000011';
const scope: Scope = { tenant: Tenant.AccountProject, id: `${accountId}:${projectId}` };

function stubHandler(
  inputKey: CdmHandlerInputKey,
  exported: readonly unknown[]
): ICdmEntityHandler {
  return {
    handlerKind: String(inputKey),
    inputKey,
    order: 100,
    validateInput: vi.fn(),
    collectPermissionRefs: vi.fn(() => [] as readonly CdmPermissionRefSpec[]),
    teardown: vi.fn(),
    apply: vi.fn(),
    export: vi.fn(async (_ctx: CdmExportContext) => exported),
  };
}

function buildService(handlers: ReadonlyArray<ICdmEntityHandler>) {
  return new ProjectPermissionExportService(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    handlers
  );
}

describe('ProjectPermissionExportService', () => {
  it('merges handler exports into canonical roles and users', async () => {
    const roleTemplate = stubHandler('roleTemplates', [
      {
        externalKey: 'role-1',
        name: 'Existing role',
        description: null,
        permissionRefs: [{ resourceSlug: 'Tag', action: 'Query', permissionId: 'p-1' }],
        metadata: null,
      },
    ]);
    const userAssignment = stubHandler('userAssignments', [
      {
        userId: 'u-1',
        roleTemplateKeys: ['role-1'],
        directPermissionRefs: [],
        metadata: null,
      },
    ]);
    const provisioned = stubHandler('provisionedUsers', []);
    const keys = stubHandler('projectUserApiKeys', []);

    const svc = buildService([roleTemplate, userAssignment, provisioned, keys]);
    const out = await svc.exportProjectPermissions({
      projectId,
      scope,
      version: 1,
    });

    expect(out.version).toBe(1);
    expect(out.roles).toEqual([
      expect.objectContaining({ key: 'role-1', name: 'Existing role', permissions: ['tag:query'] }),
    ]);
    expect(out.users).toEqual([
      expect.objectContaining({
        key: { value: 'u-1', findBy: CdmFindBy.Id },
        roles: ['role-1'],
      }),
    ]);

    expect(roleTemplate.export).toHaveBeenCalledWith(expect.objectContaining({ projectId, scope }));
    expect(userAssignment.export).toHaveBeenCalledWith(
      expect.objectContaining({ projectId, scope })
    );
  });

  it('passes the supplied transaction through to each handler.export', async () => {
    const roleTemplate = stubHandler('roleTemplates', []);
    const userAssignment = stubHandler('userAssignments', []);
    const provisioned = stubHandler('provisionedUsers', []);
    const keys = stubHandler('projectUserApiKeys', []);

    const svc = buildService([roleTemplate, userAssignment, provisioned, keys]);
    const tx = { __mockTx: true };
    await svc.exportProjectPermissions({ projectId, scope, version: 1 }, tx);

    expect(roleTemplate.export).toHaveBeenCalledWith(expect.objectContaining({ tx }));
    expect(userAssignment.export).toHaveBeenCalledWith(expect.objectContaining({ tx }));
  });

  it('rejects with ValidationError when scope is not project-scoped', async () => {
    const svc = buildService([stubHandler('roleTemplates', [])]);
    await expect(
      svc.exportProjectPermissions({
        projectId,
        scope: { tenant: Tenant.Account, id: accountId },
        version: 1,
      })
    ).rejects.toThrow(/accountProject or organizationProject/);
  });

  it('rejects when the projectId argument does not match the scope projectId segment', async () => {
    const svc = buildService([stubHandler('roleTemplates', [])]);
    await expect(
      svc.exportProjectPermissions({
        projectId: 'different-project',
        scope,
        version: 1,
      })
    ).rejects.toThrow(/scope id must contain the same projectId/);
  });

  it('rejects unsupported version', async () => {
    const svc = buildService([stubHandler('roleTemplates', [])]);
    await expect(svc.exportProjectPermissions({ projectId, scope, version: 2 })).rejects.toThrow(
      /Unsupported version/
    );
  });

  it('when sections is set, only matching handlers run export', async () => {
    const roleTemplate = stubHandler('roleTemplates', [
      { externalKey: 'r1', name: 'R', description: null, permissionRefs: [], metadata: null },
    ]);
    const userAssignment = stubHandler('userAssignments', [
      { userId: 'u-1', roleTemplateKeys: [] },
    ]);
    const keys = stubHandler('projectUserApiKeys', [{ userId: 'u-1', clientId: 'c1' }]);

    const svc = buildService([roleTemplate, userAssignment, keys]);
    const out = await svc.exportProjectPermissions({
      projectId,
      scope,
      version: 1,
      sections: ['roles'],
    });

    expect(out.roles).toEqual([expect.objectContaining({ key: 'r1' })]);
    expect(out.users).toEqual([]);
    expect(roleTemplate.export).toHaveBeenCalledTimes(1);
    expect(userAssignment.export).not.toHaveBeenCalled();
    expect(keys.export).not.toHaveBeenCalled();
  });

  it('empty sections array exports all handlers', async () => {
    const roleTemplate = stubHandler('roleTemplates', []);
    const userAssignment = stubHandler('userAssignments', []);
    const keys = stubHandler('projectUserApiKeys', []);
    const provisioned = stubHandler('provisionedUsers', []);
    const svc = buildService([roleTemplate, userAssignment, keys, provisioned]);
    await svc.exportProjectPermissions({
      projectId,
      scope,
      version: 1,
      sections: [],
    });
    expect(roleTemplate.export).toHaveBeenCalled();
    expect(userAssignment.export).toHaveBeenCalled();
    expect(keys.export).toHaveBeenCalled();
  });

  it('maps tag + role + user handler output into canonical tags and roles.users tag keys', async () => {
    const tagOpaque = '60000000-0000-4000-8000-000000000aaa';
    const roleId = '70000000-0000-4000-8000-000000000777';
    const userId = '30000000-0000-4000-8000-000000000099';
    const grantGroupId = '80000000-0000-4000-8000-0000000000g1';
    const groupKey = 'cdm-group-linked-test';

    const tag = stubHandler('tags', [
      {
        key: tagOpaque,
        name: 'Alpha',
        color: '#fff',
        metadata: null,
      },
    ]);
    const roleTemplate = stubHandler('roleTemplates', [
      {
        externalKey: roleId,
        name: 'Existing role',
        description: null,
        permissionRefs: [{ resourceSlug: 'Tag', action: 'Query', permissionId: 'p-1' }],
        metadata: null,
        tagKeys: [tagOpaque],
        groupTagKeys: [tagOpaque],
        linkedGrantGroup: {
          grantGroupId,
          groupKey,
          groupName: 'Linked group',
          groupDescription: null,
          permissionKeys: [],
          tagKeys: [tagOpaque],
          primaryGroupTagKey: null,
        },
      },
    ]);
    const userAssignment = stubHandler('userAssignments', [
      {
        userId,
        roleTemplateKeys: [roleId],
        directPermissionRefs: [],
        metadata: null,
        tagKeys: [tagOpaque],
      },
    ]);
    const provisioned = stubHandler('provisionedUsers', []);
    const keys = stubHandler('projectUserApiKeys', []);

    const svc = buildService([tag, roleTemplate, userAssignment, provisioned, keys]);
    const out = await svc.exportProjectPermissions({ projectId, scope, version: 1 });

    expect(out.tags).toEqual([expect.objectContaining({ key: tagOpaque, name: 'Alpha' })]);
    expect(out.groups).toEqual([
      expect.objectContaining({
        key: groupKey,
        name: 'Linked group',
        permissions: [],
        tags: [tagOpaque],
        primaryTag: null,
        metadata: { grantGroupId },
      }),
    ]);
    expect(out.roles).toEqual([
      expect.objectContaining({
        key: roleId,
        tags: [tagOpaque],
        groups: [groupKey],
        permissions: ['tag:query'],
      }),
    ]);
    expect(out.users).toEqual([
      expect.objectContaining({
        key: { value: userId, findBy: CdmFindBy.Id },
        tags: [tagOpaque],
      }),
    ]);
  });
});
