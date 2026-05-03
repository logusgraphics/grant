import {
  apiKeys,
  DbSchema,
  groupPermissions,
  groups,
  permissions,
  projectRoles,
  projectUserApiKeys,
  projectUsers,
  resources,
  roleGroups,
  roles,
  userRoles,
} from '@grantjs/database';
import { and, eq, inArray, isNull } from 'drizzle-orm';

import { Transaction } from '@/lib/transaction-manager.lib';

/**
 * One project role with its merged permission set, ready to be projected as
 * a CDM `RoleTemplateCdmInput`.
 */
export interface ProjectRoleWithPermissions {
  roleId: string;
  name: string;
  description: string | null;
  metadata: Record<string, unknown>;
  permissions: ProjectRolePermission[];
}

export interface ProjectRolePermission {
  permissionId: string;
  resourceSlug: string;
  action: string;
  condition: Record<string, unknown> | null;
}

/**
 * One project user with the set of project-scoped role ids they hold. Used
 * to project `UserAssignmentCdmInput` rows during export.
 */
export interface ProjectUserWithRoleIds {
  userId: string;
  roleIds: string[];
  metadata: Record<string, unknown>;
}

/** Join row for CDM export of `project_user_api_keys` + `api_keys` (no secrets). */
export interface ProjectUserApiKeyCdmExportRow {
  userId: string;
  pivotMetadata: Record<string, unknown>;
  clientId: string;
  name: string | null;
  description: string | null;
  expiresAt: Date | null;
}

/**
 * Read-only joins for the project permission export pipeline. Mirrors the
 * write-side {@link ProjectPermissionSyncRepository}: kept narrow on purpose
 * so the export service stays handler-agnostic.
 *
 * The export reads every project role + every project user; we expect
 * project-scope sets to fit comfortably in memory (validated by the same
 * invariants that bound the import shape).
 */
export class ProjectPermissionExportRepository {
  constructor(private readonly db: DbSchema) {}

  /**
   * Fetch every project role with its effective permissions (resolved through
   * the role → roleGroups → groups → groupPermissions → permissions chain).
   *
   * Permissions are deduplicated within each role: the same permission may be
   * granted by multiple groups attached to the role, but we only emit it once
   * so the round-tripped CDM payload is canonical.
   */
  public async getProjectRolesWithPermissions(
    projectId: string,
    transaction?: Transaction
  ): Promise<ProjectRoleWithPermissions[]> {
    const dbInstance = transaction ?? this.db;

    const roleRows = await dbInstance
      .select({
        roleId: roles.id,
        name: roles.name,
        description: roles.description,
        metadata: roles.metadata,
      })
      .from(projectRoles)
      .innerJoin(roles, eq(roles.id, projectRoles.roleId))
      .where(
        and(
          eq(projectRoles.projectId, projectId),
          isNull(projectRoles.deletedAt),
          isNull(roles.deletedAt)
        )
      );

    if (roleRows.length === 0) return [];

    const roleIds = roleRows.map((r) => r.roleId);

    const permissionRows = await dbInstance
      .select({
        roleId: roleGroups.roleId,
        permissionId: permissions.id,
        action: permissions.action,
        condition: permissions.condition,
        resourceSlug: resources.slug,
      })
      .from(roleGroups)
      .innerJoin(groups, eq(groups.id, roleGroups.groupId))
      .innerJoin(groupPermissions, eq(groupPermissions.groupId, groups.id))
      .innerJoin(permissions, eq(permissions.id, groupPermissions.permissionId))
      .innerJoin(resources, eq(resources.id, permissions.resourceId))
      .where(
        and(
          inArray(roleGroups.roleId, roleIds),
          isNull(roleGroups.deletedAt),
          isNull(groups.deletedAt),
          isNull(groupPermissions.deletedAt),
          isNull(permissions.deletedAt),
          isNull(resources.deletedAt)
        )
      );

    const permsByRole = new Map<string, Map<string, ProjectRolePermission>>();
    for (const row of permissionRows) {
      let perRole = permsByRole.get(row.roleId);
      if (!perRole) {
        perRole = new Map<string, ProjectRolePermission>();
        permsByRole.set(row.roleId, perRole);
      }
      if (!perRole.has(row.permissionId)) {
        perRole.set(row.permissionId, {
          permissionId: row.permissionId,
          resourceSlug: row.resourceSlug,
          action: row.action,
          condition: (row.condition as Record<string, unknown> | null) ?? null,
        });
      }
    }

    return roleRows.map((r) => {
      const perRole = permsByRole.get(r.roleId);
      const permissionsList = perRole ? Array.from(perRole.values()) : [];
      permissionsList.sort((a, b) => {
        if (a.resourceSlug !== b.resourceSlug) return a.resourceSlug < b.resourceSlug ? -1 : 1;
        if (a.action !== b.action) return a.action < b.action ? -1 : 1;
        return a.permissionId < b.permissionId ? -1 : 1;
      });
      return {
        roleId: r.roleId,
        name: r.name,
        description: r.description,
        metadata: (r.metadata as Record<string, unknown>) ?? {},
        permissions: permissionsList,
      };
    });
  }

  /**
   * Fetch every project user with the project-scoped role ids they hold.
   * Filters `userRoles` by the role ids that belong to the project, so users
   * who are project members but hold no project-scoped role still appear with
   * an empty `roleIds` list (and are therefore skipped by the user-assignment
   * handler's `export`, which only emits assignments with at least one role).
   */
  public async getProjectUsersWithRoleIds(
    projectId: string,
    transaction?: Transaction
  ): Promise<ProjectUserWithRoleIds[]> {
    const dbInstance = transaction ?? this.db;

    const projectRoleIdRows = await dbInstance
      .select({ roleId: projectRoles.roleId })
      .from(projectRoles)
      .where(and(eq(projectRoles.projectId, projectId), isNull(projectRoles.deletedAt)));
    const projectRoleIds = projectRoleIdRows.map((r) => r.roleId);

    const userRows = await dbInstance
      .select({
        userId: projectUsers.userId,
        metadata: projectUsers.metadata,
      })
      .from(projectUsers)
      .where(and(eq(projectUsers.projectId, projectId), isNull(projectUsers.deletedAt)));

    if (userRows.length === 0) return [];

    if (projectRoleIds.length === 0) {
      return userRows.map((u) => ({
        userId: u.userId,
        roleIds: [],
        metadata: (u.metadata as Record<string, unknown>) ?? {},
      }));
    }

    const userIds = userRows.map((u) => u.userId);
    const userRoleRows = await dbInstance
      .select({ userId: userRoles.userId, roleId: userRoles.roleId })
      .from(userRoles)
      .where(
        and(
          inArray(userRoles.userId, userIds),
          inArray(userRoles.roleId, projectRoleIds),
          isNull(userRoles.deletedAt)
        )
      );

    const rolesByUser = new Map<string, Set<string>>();
    for (const row of userRoleRows) {
      let s = rolesByUser.get(row.userId);
      if (!s) {
        s = new Set<string>();
        rolesByUser.set(row.userId, s);
      }
      s.add(row.roleId);
    }

    return userRows.map((u) => ({
      userId: u.userId,
      roleIds: Array.from(rolesByUser.get(u.userId) ?? []).sort(),
      metadata: (u.metadata as Record<string, unknown>) ?? {},
    }));
  }

  /**
   * All active project-user API keys for the project (for CDM export). Includes
   * keys not created by CDM (no `cdmImport`); the handler decides emission shape.
   */
  public async getProjectUserApiKeysForCdmExport(
    projectId: string,
    transaction?: Transaction
  ): Promise<ProjectUserApiKeyCdmExportRow[]> {
    const dbInstance = transaction ?? this.db;

    const rows = await dbInstance
      .select({
        userId: projectUserApiKeys.userId,
        pivotMetadata: projectUserApiKeys.metadata,
        clientId: apiKeys.clientId,
        name: apiKeys.name,
        description: apiKeys.description,
        expiresAt: apiKeys.expiresAt,
      })
      .from(projectUserApiKeys)
      .innerJoin(apiKeys, eq(apiKeys.id, projectUserApiKeys.apiKeyId))
      .where(
        and(
          eq(projectUserApiKeys.projectId, projectId),
          isNull(projectUserApiKeys.deletedAt),
          isNull(apiKeys.deletedAt),
          eq(apiKeys.isRevoked, false)
        )
      );

    return rows.map((r) => ({
      userId: r.userId,
      pivotMetadata:
        r.pivotMetadata != null &&
        typeof r.pivotMetadata === 'object' &&
        !Array.isArray(r.pivotMetadata)
          ? (r.pivotMetadata as Record<string, unknown>)
          : {},
      clientId: r.clientId,
      name: r.name,
      description: r.description,
      expiresAt: r.expiresAt,
    }));
  }
}
