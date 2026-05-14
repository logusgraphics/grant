import type {
  IGroupPermissionService,
  IGroupService,
  IProjectGroupService,
  IProjectPermissionService,
  IProjectResourceService,
  IProjectRoleService,
  IRoleGroupService,
  IRoleService,
  IUserRoleService,
} from '@grantjs/core';
import { Scope } from '@grantjs/schema';

import { buildCdmImportMetadata, mergeCdmImporterMetadata } from '@/constants/cdm-import.constants';
import { Transaction } from '@/lib/transaction-manager.lib';
import {
  ProjectSyncRepository,
  ResolvedCdmPermission,
} from '@/repositories/project-sync.repository';

/**
 * Counters for one role+group creation pass. CDM handlers fold these into the
 * shared `SyncProjectResult` after calling the builder.
 */
export interface CdmRoleCreationCounts {
  roleGroups: number;
  groupPermissions: number;
  projectRoles: number;
  projectGroups: number;
  projectPermissions: number;
  projectResources: number;
}

export interface CdmRoleCreationResult {
  roleId: string;
  groupId: string;
  counts: CdmRoleCreationCounts;
}

/** Optional display labels when the CDM document already supplies human names. */
export interface CdmRoleWithGroupNaming {
  groupDisplayName?: string | null;
  groupDisplayDescription?: string | null;
}

/**
 * Cross-handler primitives for creating, removing, and book-keeping CDM-marked
 * roles/groups. Owned by the orchestrator; injected into handlers so the
 * "create role + paired group + project links" recipe lives in one place.
 *
 * The recipe was previously private to {@link ProjectSyncService};
 * extracting it here lets future handlers (API keys, project apps, …) reuse
 * it without forking the orchestrator.
 */
export class CdmEntityBuilder {
  constructor(
    private readonly syncRepo: ProjectSyncRepository,
    private readonly roles: IRoleService,
    private readonly groups: IGroupService,
    private readonly roleGroups: IRoleGroupService,
    private readonly groupPermissions: IGroupPermissionService,
    private readonly projectRoles: IProjectRoleService,
    private readonly projectGroups: IProjectGroupService,
    private readonly projectPermissions: IProjectPermissionService,
    private readonly projectResources: IProjectResourceService,
    private readonly userRoles: IUserRoleService
  ) {}

  /**
   * Create a CDM-marked role + paired group, link permissions to the group,
   * and ensure the project has rows in `project_*` for everything touched.
   *
   * `kind` is the metadata kind written to `metadata.cdmImport.kind`. Use
   * `'role'` for normal templates and `'directRole'` for direct-user-role
   * bundles created from `userAssignments[].directPermissionRefs`.
   */
  public async createRoleWithGroup(
    projectId: string,
    _scope: Scope,
    externalKey: string,
    name: string,
    description: string | null,
    kind: 'role' | 'directRole',
    perms: readonly ResolvedCdmPermission[],
    importerMetadata: unknown,
    tx: Transaction,
    naming?: CdmRoleWithGroupNaming
  ): Promise<CdmRoleCreationResult> {
    const groupLabel =
      naming?.groupDisplayName != null && String(naming.groupDisplayName).trim() !== ''
        ? String(naming.groupDisplayName).trim()
        : `CDM: ${externalKey}`;
    const groupName = this.truncateName(groupLabel);
    const groupDescription =
      naming?.groupDisplayDescription != null &&
      String(naming.groupDisplayDescription).trim() !== ''
        ? String(naming.groupDisplayDescription).trim()
        : (description ?? `Imported group for ${externalKey}`);
    const groupMetadata = mergeCdmImporterMetadata(
      buildCdmImportMetadata(projectId, 'group', externalKey),
      importerMetadata
    );
    const group = await this.groups.createGroup(
      {
        name: groupName,
        description: groupDescription,
        metadata: groupMetadata,
      },
      tx
    );
    await this.projectGroups.addProjectGroup({ projectId, groupId: group.id }, tx);

    let groupPermissionsLinked = 0;
    let projectPermissionsLinked = 0;
    let projectResourcesLinked = 0;
    for (const p of perms) {
      const hasGp = await this.groupHasPermission(group.id, p.id, tx);
      if (!hasGp) {
        await this.groupPermissions.addGroupPermission(
          { groupId: group.id, permissionId: p.id },
          tx
        );
        groupPermissionsLinked += 1;
      }
      const n = await this.ensureProjectPermissionAndResource(projectId, p, tx);
      projectPermissionsLinked += n.permissions;
      projectResourcesLinked += n.resources;
    }

    const roleName = this.truncateName(name.trim());
    const roleMetadata = mergeCdmImporterMetadata(
      buildCdmImportMetadata(projectId, kind, externalKey),
      importerMetadata
    );
    const role = await this.roles.createRole(
      {
        name: roleName,
        description: description ?? undefined,
        metadata: roleMetadata,
      },
      tx
    );
    await this.projectRoles.addProjectRole({ projectId, roleId: role.id }, tx);
    await this.roleGroups.addRoleGroup({ roleId: role.id, groupId: group.id }, tx);

    return {
      roleId: role.id,
      groupId: group.id,
      counts: {
        roleGroups: 1,
        groupPermissions: groupPermissionsLinked,
        projectRoles: 1,
        projectGroups: 1,
        projectPermissions: projectPermissionsLinked,
        projectResources: projectResourcesLinked,
      },
    };
  }

  /**
   * Remove a CDM-marked role: detach from the project, revoke all user-role
   * links, unlink any role-group bindings, then soft-delete the role itself.
   * Idempotent — safe to call against a partially torn-down row.
   */
  public async deleteCdmRole(
    roleId: string,
    projectId: string,
    _scope: Scope,
    tx: Transaction
  ): Promise<void> {
    await this.projectRoles.removeProjectRole({ projectId, roleId }, tx);
    const userLinks = await this.syncRepo.listActiveUserRolesForRoleIds([roleId], tx);
    for (const ur of userLinks) {
      await this.userRoles.removeUserRole({ userId: ur.userId, roleId: ur.roleId }, tx);
    }
    const rgs = await this.roleGroups.getRoleGroups({ roleId }, tx);
    for (const rg of rgs) {
      await this.roleGroups.removeRoleGroup({ roleId: rg.roleId, groupId: rg.groupId }, tx);
    }
    await this.roles.deleteRole({ id: roleId }, tx);
  }

  /**
   * Remove a CDM-marked group: detach from the project, drop all
   * group-permission links, unlink role-group bindings, then soft-delete the
   * group. Idempotent.
   */
  public async deleteCdmGroup(
    groupId: string,
    projectId: string,
    _scope: Scope,
    tx: Transaction
  ): Promise<void> {
    await this.projectGroups.removeProjectGroup({ projectId, groupId }, tx);
    const gps = await this.groupPermissions.getGroupPermissions({ groupId }, tx);
    for (const gp of gps) {
      await this.groupPermissions.removeGroupPermission(
        { groupId, permissionId: gp.permissionId },
        tx
      );
    }
    const rgs = await this.roleGroups.getRoleGroups({ groupId }, tx);
    for (const rg of rgs) {
      await this.roleGroups.removeRoleGroup({ roleId: rg.roleId, groupId: rg.groupId }, tx);
    }
    await this.groups.deleteGroup({ id: groupId }, tx);
  }

  /** Names are truncated to fit the 255-char column with an ellipsis suffix. */
  public truncateName(name: string): string {
    return name.length > 255 ? name.slice(0, 252) + '…' : name;
  }

  private async groupHasPermission(
    groupId: string,
    permissionId: string,
    tx: Transaction
  ): Promise<boolean> {
    const list = await this.groupPermissions.getGroupPermissions({ groupId }, tx);
    return list.some((g) => g.permissionId === permissionId);
  }

  private async ensureProjectPermissionAndResource(
    projectId: string,
    p: ResolvedCdmPermission,
    tx: Transaction
  ): Promise<{ permissions: number; resources: number }> {
    let permissions = 0;
    let resources = 0;
    const pList = await this.projectPermissions.getProjectPermissions({ projectId }, tx);
    if (!pList.some((x) => x.permissionId === p.id)) {
      await this.projectPermissions.addProjectPermission({ projectId, permissionId: p.id }, tx);
      permissions = 1;
    }
    if (p.resourceId) {
      const rList = await this.projectResources.getProjectResources({ projectId }, tx);
      if (!rList.some((x) => x.resourceId === p.resourceId)) {
        await this.projectResources.addProjectResource(
          { projectId, resourceId: p.resourceId! },
          tx
        );
        resources = 1;
      }
    }
    return { permissions, resources };
  }
}
