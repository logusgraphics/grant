import type {
  CdmApplyContext,
  CdmExportContext,
  CdmPermissionRefSpec,
  CdmTeardownContext,
  ICdmEntityHandler,
  IProjectUserService,
  IUserRoleService,
} from '@grantjs/core';
import { SyncProjectPermissionsInput, UserAssignmentCdmInput } from '@grantjs/schema';

import { CDM_IMPORT_METADATA_KEY, CDM_SOURCE_METADATA_KEY } from '@/constants/cdm-import.constants';
import { ConflictError, ValidationError } from '@/lib/errors';
import { Transaction } from '@/lib/transaction-manager.lib';
import type { ProjectPermissionExportRepository } from '@/repositories/project-permission-export.repository';
import type { ResolvedCdmPermission } from '@/repositories/project-permission-sync.repository';

import type { CdmEntityBuilder } from './cdm-entity-builder';

const USER_ASSIGNMENT_INPUT_KEY: keyof SyncProjectPermissionsInput = 'userAssignments';

/**
 * Handler for `userAssignments`. Owns:
 *
 * - direct-user-role bundles (one CDM-marked role with `kind = 'directRole'`
 *   per user with `directPermissionRefs`),
 * - user → project membership (`project_users` upsert + `cdmSource` metadata
 *   merge),
 * - role assignments (`user_roles` rows pointing at template-handler roles
 *   referenced via `produced.roleTemplateIds`).
 */
export class UserAssignmentHandler implements ICdmEntityHandler<
  UserAssignmentCdmInput,
  UserAssignmentCdmInput
> {
  public readonly handlerKind = 'userAssignment';
  public readonly inputKey = USER_ASSIGNMENT_INPUT_KEY;
  public readonly order = 20;

  constructor(
    private readonly exportRepo: ProjectPermissionExportRepository,
    private readonly builder: CdmEntityBuilder,
    private readonly projectUsers: IProjectUserService,
    private readonly userRoles: IUserRoleService
  ) {}

  public validateInput(input: readonly UserAssignmentCdmInput[]): void {
    const userIdsSeen = new Set<string>();
    for (const ua of input) {
      if (userIdsSeen.has(ua.userId)) {
        throw new ValidationError(`Duplicate userId in userAssignments: ${ua.userId}`);
      }
      userIdsSeen.add(ua.userId);
    }
  }

  public collectPermissionRefs(
    input: readonly UserAssignmentCdmInput[]
  ): readonly CdmPermissionRefSpec[] {
    const refs: CdmPermissionRefSpec[] = [];
    for (const ua of input) {
      for (const r of ua.directPermissionRefs ?? []) {
        refs.push({
          resourceSlug: r.resourceSlug,
          action: r.action,
          permissionId: r.permissionId ?? null,
          condition: (r.condition as Record<string, unknown> | null | undefined) ?? null,
        });
      }
    }
    return refs;
  }

  /**
   * No-op. Direct-user-role roles + groups created by this handler are
   * torn down by the role-template handler's monolithic sweep, because they
   * share `metadata.cdmImport.kind = 'group'` with template groups and the
   * project-id filter alone is enough to find them.
   *
   * Future entity handlers (API keys, project apps, …) own their teardown
   * and should perform their kind-specific delete here.
   */
  public async teardown(_ctx: CdmTeardownContext): Promise<void> {
    return;
  }

  public async apply(
    ctx: CdmApplyContext,
    input: readonly UserAssignmentCdmInput[]
  ): Promise<void> {
    const tx = ctx.tx as Transaction;
    const directUserIdToRoleId = new Map<string, string>();

    for (const ua of input) {
      const directRefs = ua.directPermissionRefs ?? [];
      const roleKeys = ua.roleTemplateKeys ?? [];

      if (directRefs.length > 0) {
        const perms = directRefs.map(
          (r) =>
            ctx.lookupResolvedRef({
              resourceSlug: r.resourceSlug,
              action: r.action,
              permissionId: r.permissionId ?? null,
              condition: (r.condition as Record<string, unknown> | null | undefined) ?? null,
            }) as ResolvedCdmPermission
        );
        const externalKey = `direct:${ua.userId}`;
        const { roleId, counts } = await this.builder.createRoleWithGroup(
          ctx.projectId,
          ctx.scope,
          externalKey,
          `Direct (${ua.userId.slice(0, 8)}…)`,
          'Direct permission bundle from CDM',
          'directRole',
          perms,
          undefined,
          tx
        );
        directUserIdToRoleId.set(ua.userId, roleId);
        ctx.result.rolesCreated += 1;
        ctx.result.groupsCreated += 1;
        ctx.result.roleGroupsLinked += counts.roleGroups;
        ctx.result.groupPermissionsLinked += counts.groupPermissions;
        ctx.result.projectRolesLinked += counts.projectRoles;
        ctx.result.projectGroupsLinked += counts.projectGroups;
        ctx.result.projectPermissionsLinked += counts.projectPermissions;
        ctx.result.projectResourcesLinked += counts.projectResources;
      }

      if (directRefs.length === 0 && roleKeys.length === 0) {
        ctx.result.warnings.push(
          `userAssignments: user ${ua.userId} has no roleTemplateKeys or directPermissionRefs; skipped`
        );
        continue;
      }

      try {
        await this.projectUsers.addProjectUser({ projectId: ctx.projectId, userId: ua.userId }, tx);
        ctx.result.projectUsersEnsured += 1;
      } catch (err) {
        if (err instanceof ConflictError) {
          /* already a project member; idempotent */
        } else {
          throw err;
        }
      }

      if (ua.metadata != null) {
        await this.projectUsers.mergeProjectUserCdmMetadata(
          {
            projectId: ctx.projectId,
            userId: ua.userId,
            importerMetadata: ua.metadata as Record<string, unknown>,
          },
          tx
        );
      }

      for (const key of roleKeys) {
        const rid = ctx.produced.roleTemplateIds.get(key);
        if (!rid) {
          throw new ValidationError(`Unknown roleTemplateKey for user ${ua.userId}: ${key}`);
        }
        await this.userRoles.addUserRole({ userId: ua.userId, roleId: rid }, tx);
        ctx.result.userRolesAssigned += 1;
      }

      if (directRefs.length > 0) {
        const drid = directUserIdToRoleId.get(ua.userId);
        if (drid) {
          await this.userRoles.addUserRole({ userId: ua.userId, roleId: drid }, tx);
          ctx.result.userRolesAssigned += 1;
        }
      }
    }
  }

  /**
   * Project current project-users + their assigned project roles back to the
   * CDM `UserAssignmentCdmInput` shape.
   *
   * Behaviour:
   *
   * - `roleTemplateKeys[i]` is the role id (matches `RoleTemplateHandler.export`'s
   *   `externalKey`).
   * - `directPermissionRefs` is always empty in v1: Grant has no user-direct
   *   permissions outside roles, so all permissions are exported via roles.
   *   Re-importing the snapshot will not recreate "direct" CDM roles
   *   automatically; that is fine because direct roles are themselves project
   *   roles and thus emitted by the role-template handler.
   * - Users with zero project-scoped role assignments are skipped, since
   *   the import contract requires at least one of `roleTemplateKeys` or
   *   `directPermissionRefs` to be non-empty.
   * - `metadata` carries the project-user's `cdmSource` payload, dropping the
   *   reserved `cdmImport` envelope.
   */
  public async export(ctx: CdmExportContext): Promise<readonly UserAssignmentCdmInput[]> {
    const tx = ctx.tx as Transaction | undefined;
    const rows = await this.exportRepo.getProjectUsersWithRoleIds(ctx.projectId, tx);
    return rows
      .filter((u) => u.roleIds.length > 0)
      .map((u) => ({
        userId: u.userId,
        roleTemplateKeys: u.roleIds,
        directPermissionRefs: [],
        metadata: extractCdmSourceMetadata(u.metadata),
      }));
  }
}

/**
 * Extract the importer-owned `cdmSource` payload, dropping Grant's reserved
 * `cdmImport` envelope so the round-tripped export can be re-imported via
 * `mergeCdmImporterMetadata` without the reserved-key violation check firing.
 */
function extractCdmSourceMetadata(
  metadata: Record<string, unknown>
): Record<string, unknown> | null {
  const source = metadata[CDM_SOURCE_METADATA_KEY];
  if (source == null || typeof source !== 'object' || Array.isArray(source)) {
    return null;
  }
  const out = { ...(source as Record<string, unknown>) };
  delete out[CDM_IMPORT_METADATA_KEY];
  return Object.keys(out).length > 0 ? out : null;
}
