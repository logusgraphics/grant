/**
 * Unit tests for ProjectPermissionExportService.
 *
 * The service iterates the same `ICdmEntityHandler[]` registry as the sync
 * service and assembles each handler's `export(...)` output into the field on
 * `SyncProjectPermissionsInput` it owns. We mock handlers entirely so the
 * test pins the orchestrator's wiring contract rather than the role-template
 * read joins (those are covered by the export repo's own tests).
 */
import type { CdmExportContext, CdmPermissionRefSpec, ICdmEntityHandler } from '@grantjs/core';
import { type Scope, type SyncProjectPermissionsInput, Tenant } from '@grantjs/schema';
import { describe, expect, it, vi } from 'vitest';

import { ProjectPermissionExportService } from '@/services/project-permission-export.service';

const accountId = '10000000-0000-4000-8000-000000000020';
const projectId = '10000000-0000-4000-8000-000000000011';
const scope: Scope = { tenant: Tenant.AccountProject, id: `${accountId}:${projectId}` };

function stubHandler(
  inputKey: keyof SyncProjectPermissionsInput,
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
    handlers
  );
}

describe('ProjectPermissionExportService', () => {
  it('assembles a SyncProjectPermissionsInput by writing each handler.export into its inputKey slot', async () => {
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

    const svc = buildService([roleTemplate, userAssignment]);
    const out = await svc.exportProjectPermissions({
      projectId,
      scope,
      cdmVersion: 1,
    });

    expect(out.cdmVersion).toBe(1);
    expect(out.roleTemplates).toEqual([
      expect.objectContaining({ externalKey: 'role-1', name: 'Existing role' }),
    ]);
    expect(out.userAssignments).toEqual([
      expect.objectContaining({ userId: 'u-1', roleTemplateKeys: ['role-1'] }),
    ]);

    expect(roleTemplate.export).toHaveBeenCalledWith(expect.objectContaining({ projectId, scope }));
    expect(userAssignment.export).toHaveBeenCalledWith(
      expect.objectContaining({ projectId, scope })
    );
  });

  it('passes the supplied transaction through to each handler.export', async () => {
    const roleTemplate = stubHandler('roleTemplates', []);
    const userAssignment = stubHandler('userAssignments', []);

    const svc = buildService([roleTemplate, userAssignment]);
    const tx = { __mockTx: true };
    await svc.exportProjectPermissions({ projectId, scope, cdmVersion: 1 }, tx);

    expect(roleTemplate.export).toHaveBeenCalledWith(expect.objectContaining({ tx }));
    expect(userAssignment.export).toHaveBeenCalledWith(expect.objectContaining({ tx }));
  });

  it('rejects with ValidationError when scope is not project-scoped', async () => {
    const svc = buildService([stubHandler('roleTemplates', [])]);
    await expect(
      svc.exportProjectPermissions({
        projectId,
        scope: { tenant: Tenant.Account, id: accountId },
        cdmVersion: 1,
      })
    ).rejects.toThrow(/accountProject or organizationProject/);
  });

  it('rejects when the projectId argument does not match the scope projectId segment', async () => {
    const svc = buildService([stubHandler('roleTemplates', [])]);
    await expect(
      svc.exportProjectPermissions({
        projectId: 'different-project',
        scope,
        cdmVersion: 1,
      })
    ).rejects.toThrow(/scope id must contain the same projectId/);
  });

  it('rejects unsupported cdmVersion', async () => {
    const svc = buildService([stubHandler('roleTemplates', [])]);
    await expect(svc.exportProjectPermissions({ projectId, scope, cdmVersion: 2 })).rejects.toThrow(
      /Unsupported cdmVersion/
    );
  });
});
