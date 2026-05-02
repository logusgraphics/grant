import type {
  CdmExportContext,
  ICdmEntityHandler,
  IGroupPermissionService,
  IGroupService,
  IProjectGroupService,
  IProjectPermissionExportService,
  IProjectPermissionService,
  IProjectResourceService,
  IProjectRoleService,
  IProjectUserService,
  IRoleGroupService,
  IRoleService,
  IUserRoleService,
} from '@grantjs/core';
import { Scope, SyncProjectPermissionsInput, Tenant } from '@grantjs/schema';

import { ValidationError } from '@/lib/errors';
import { Transaction } from '@/lib/transaction-manager.lib';
import type { ProjectPermissionExportRepository } from '@/repositories/project-permission-export.repository';
import type { ProjectPermissionSyncRepository } from '@/repositories/project-permission-sync.repository';

import { createDefaultCdmHandlers } from './cdm';

/**
 * Inverse of {@link ProjectPermissionSyncService}: snapshots the project's
 * current permission/role/group/user-assignment state and packages it as a
 * replay-ready `SyncProjectPermissionsInput`.
 *
 * Iterates the same `ICdmEntityHandler[]` registry used by the sync service.
 * The full-project export shape is therefore determined entirely by the
 * handlers: adding a new entity (API keys, project apps, …) adds a new
 * field to the exported CDM artifact automatically, with no changes here.
 *
 * Used by:
 *  - the standalone REST export endpoint (clone a project, manual backups),
 *  - the sync worker, to capture a pre-import rollback snapshot inside the
 *    same transaction as the import.
 */
export class ProjectPermissionExportService implements IProjectPermissionExportService {
  private readonly handlers: ReadonlyArray<ICdmEntityHandler>;

  constructor(
    syncRepo: ProjectPermissionSyncRepository,
    exportRepo: ProjectPermissionExportRepository,
    roles: IRoleService,
    groups: IGroupService,
    roleGroups: IRoleGroupService,
    groupPermissions: IGroupPermissionService,
    projectRoles: IProjectRoleService,
    projectGroups: IProjectGroupService,
    projectPermissions: IProjectPermissionService,
    projectResources: IProjectResourceService,
    projectUsers: IProjectUserService,
    userRoles: IUserRoleService,
    handlers?: ReadonlyArray<ICdmEntityHandler>
  ) {
    this.handlers =
      handlers ??
      createDefaultCdmHandlers({
        syncRepo,
        exportRepo,
        roles,
        groups,
        roleGroups,
        groupPermissions,
        projectRoles,
        projectGroups,
        projectPermissions,
        projectResources,
        projectUsers,
        userRoles,
      });
  }

  public async exportProjectPermissions(
    params: { projectId: string; scope: Scope; cdmVersion: number },
    transaction?: unknown
  ): Promise<SyncProjectPermissionsInput> {
    this.assertProjectScope(params.scope);
    const scopeProjectId = this.projectIdFromScope(params.scope);
    if (scopeProjectId !== params.projectId) {
      throw new ValidationError(
        'scope id must contain the same projectId as the projectId argument'
      );
    }
    if (params.cdmVersion !== 1) {
      throw new ValidationError('Unsupported cdmVersion; only 1 is allowed');
    }

    const tx = transaction as Transaction | undefined;

    const exportCtx: CdmExportContext = {
      projectId: params.projectId,
      scope: params.scope,
      tx,
    };

    const result: SyncProjectPermissionsInput = {
      cdmVersion: params.cdmVersion,
      importId: null,
      roleTemplates: [],
      userAssignments: [],
    };

    for (const handler of this.handlers) {
      const slice = await handler.export(exportCtx);
      // Each handler writes to the field on the canonical input shape it
      // owns. Casting here is the registry's escape hatch for typing the
      // dynamic slot assignment (the `inputKey` is constrained to keys of
      // `SyncProjectPermissionsInput` at the port level).
      (result as unknown as Record<string, readonly unknown[]>)[handler.inputKey] = slice;
    }

    return result;
  }

  private assertProjectScope(scope: Scope): void {
    if (scope.tenant !== Tenant.AccountProject && scope.tenant !== Tenant.OrganizationProject) {
      throw new ValidationError(
        'exportProjectPermissions requires accountProject or organizationProject scope'
      );
    }
  }

  private projectIdFromScope(scope: Scope): string {
    return scope.id.split(':')[1] ?? '';
  }
}
