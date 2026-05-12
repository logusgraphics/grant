import type {
  CdmApplyContext,
  CdmExportContext,
  CdmPermissionRefSpec,
  CdmTeardownContext,
  ICdmEntityHandler,
  IProjectUserService,
  IUserRoleService,
  IUserTagService,
} from '@grantjs/core';

import { extractProjectUserMetadataForCdmExport } from '@/constants/cdm-import.constants';
import { ConflictError, ValidationError } from '@/lib/errors';
import { Transaction } from '@/lib/transaction-manager.lib';
import type { ProjectPermissionExportRepository } from '@/repositories/project-permission-export.repository';
import type { ResolvedCdmPermission } from '@/repositories/project-permission-sync.repository';

import type { CdmEntityBuilder } from './cdm-entity-builder';
import type { CdmUserAssignmentInternal } from './cdm-internal.types';
import { buildExternalKey } from './identity.helper';

const USER_ASSIGNMENT_INPUT_KEY = 'userAssignments' as const;

/**
 * Handler for `userAssignments`. Owns:
 *
 * - direct-user-role bundles (one CDM-marked role with `kind = 'directRole'`
 *   per user with `directPermissionRefs`),
 * - user → project membership (`project_users` upsert + `cdmSource` metadata
 *   merge),
 * - role assignments (`user_roles` rows pointing at template-handler roles
 *   referenced via `produced.roleIdsByKey`).
 */
export class UserAssignmentHandler implements ICdmEntityHandler<
  CdmUserAssignmentInternal,
  CdmUserAssignmentInternal
> {
  public readonly handlerKind = 'userAssignment';
  public readonly inputKey = USER_ASSIGNMENT_INPUT_KEY;
  public readonly order = 20;

  constructor(
    private readonly exportRepo: ProjectPermissionExportRepository,
    private readonly builder: CdmEntityBuilder,
    private readonly projectUsers: IProjectUserService,
    private readonly userRoles: IUserRoleService,
    private readonly userTags: IUserTagService
  ) {}

  public validateInput(input: readonly CdmUserAssignmentInternal[]): void {
    for (const [i, ua] of input.entries()) {
      if (ua.tagKeys != null) {
        const seen = new Set<string>();
        for (const k of ua.tagKeys) {
          if (seen.has(k)) {
            throw new ValidationError(`userAssignments[${i}].tagKeys: duplicate value '${k}'`);
          }
          seen.add(k);
        }
      }
    }
  }

  public collectPermissionRefs(
    input: readonly CdmUserAssignmentInternal[]
  ): readonly CdmPermissionRefSpec[] {
    const refs: CdmPermissionRefSpec[] = [];
    for (const ua of input) {
      for (const r of ua.directPermissionRefs ?? []) {
        if (r.permissionKey != null && r.permissionKey !== '') {
          refs.push({
            permissionKey: r.permissionKey,
            permissionId: r.permissionId ?? null,
            resourceSlug: r.resourceSlug ?? null,
            action: r.action ?? null,
            condition: (r.condition as Record<string, unknown> | null | undefined) ?? null,
          });
          continue;
        }
        refs.push({
          resourceSlug: r.resourceSlug ?? null,
          action: r.action ?? null,
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
    input: readonly CdmUserAssignmentInternal[]
  ): Promise<void> {
    const tx = ctx.tx as Transaction;
    const directUserIdToRoleId = new Map<string, string>();

    for (const ua of input) {
      const effectiveUserId = resolveAssignmentUserId(ua, ctx);
      const directRefs = ua.directPermissionRefs ?? [];
      const roleKeys = ua.roleTemplateKeys ?? [];

      if (directRefs.length > 0) {
        const perms = directRefs.map(
          (r) =>
            ctx.lookupResolvedRef({
              permissionKey: r.permissionKey ?? null,
              resourceSlug: r.resourceSlug ?? null,
              action: r.action ?? null,
              permissionId: r.permissionId ?? null,
              condition: (r.condition as Record<string, unknown> | null | undefined) ?? null,
            }) as ResolvedCdmPermission
        );
        const externalKey = `direct:${effectiveUserId}`;
        const { roleId, counts } = await this.builder.createRoleWithGroup(
          ctx.projectId,
          ctx.scope,
          externalKey,
          `Direct (${effectiveUserId.slice(0, 8)}…)`,
          'Direct permission bundle from CDM',
          'directRole',
          perms,
          undefined,
          tx
        );
        directUserIdToRoleId.set(effectiveUserId, roleId);
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
          `userAssignments: user ${effectiveUserId} has no roleTemplateKeys or directPermissionRefs; skipped`
        );
        continue;
      }

      try {
        await this.projectUsers.addProjectUser(
          { projectId: ctx.projectId, userId: effectiveUserId },
          tx
        );
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
            userId: effectiveUserId,
            importerMetadata: ua.metadata as Record<string, unknown>,
          },
          tx
        );
      }

      for (const key of roleKeys) {
        const rid = ctx.produced.roleIdsByKey.get(key);
        if (!rid) {
          throw new ValidationError(`Unknown roleTemplateKey for user ${effectiveUserId}: ${key}`);
        }
        await this.userRoles.addUserRole({ userId: effectiveUserId, roleId: rid }, tx);
        ctx.result.userRolesAssigned += 1;
      }

      if (directRefs.length > 0) {
        const drid = directUserIdToRoleId.get(effectiveUserId);
        if (drid) {
          await this.userRoles.addUserRole({ userId: effectiveUserId, roleId: drid }, tx);
          ctx.result.userRolesAssigned += 1;
        }
      }

      for (const tagKey of ua.tagKeys ?? []) {
        const tagId = ctx.produced.tagIds.get(tagKey);
        if (!tagId) {
          throw new ValidationError(
            `userAssignments[${effectiveUserId}]: unknown tagKey '${tagKey}'; must appear in the tags section`
          );
        }
        const isPrimary = tagKey === (ua.primaryUserTagKey ?? '');
        await this.userTags.addUserTag({ userId: effectiveUserId, tagId, isPrimary }, tx);
        ctx.result.userTagsLinked += 1;
      }
    }
  }

  /**
   * Project current project-users + their assigned project roles back to the
   * CDM `UserAssignmentCdmInput` shape.
   *
   * Behaviour:
   *
   * - `roleTemplateKeys[i]` is the opaque role external key (matches
   *   `RoleTemplateHandler.export`'s `externalKey`), so re-imports never carry
   *   Grant role UUIDs as identity. The mapping is recomputed here from the
   *   project's roles via `buildExternalKey('role', roleId, name)`.
   * - `tagKeys` use opaque tag external keys (`buildExternalKey('tag', ...)`)
   *   so they round-trip cleanly. Tags on `user_tags` that are not in the
   *   project's `project_tags` are omitted (the cross-reference would not
   *   resolve on re-import as a self-contained document).
   * - `directPermissionRefs` is always empty in v1: Grant has no user-direct
   *   permissions outside roles, so all permissions are exported via roles.
   * - Users with zero project-scoped role assignments are skipped, since
   *   the import contract requires at least one of `roleTemplateKeys` or
   *   `directPermissionRefs` to be non-empty.
   * - `metadata` carries importer-visible membership JSON: keys under
   *   `cdmSource` plus any other top-level keys on `project_users.metadata`
   *   (e.g. API updates), excluding Grant's `cdmImport` envelope.
   */
  public async export(ctx: CdmExportContext): Promise<readonly CdmUserAssignmentInternal[]> {
    const tx = ctx.tx as Transaction | undefined;
    const [rows, roleRows, projectTagDefs] = await Promise.all([
      this.exportRepo.getProjectUsersWithRoleIds(ctx.projectId, tx),
      this.exportRepo.getProjectRolesWithPermissions(ctx.projectId, tx),
      this.exportRepo.getProjectTagDefinitions(ctx.projectId, tx),
    ]);
    const visible = rows.filter((u) => u.roleIds.length > 0);
    if (visible.length === 0) return [];

    const roleKeyById = new Map<string, string>();
    for (const r of roleRows) {
      const name = r.name.startsWith('CDM: ') ? r.name.slice('CDM: '.length) : r.name;
      roleKeyById.set(r.roleId, buildExternalKey('role', r.roleId, name));
    }

    const tagKeyByTagId = new Map<string, string>();
    for (const t of projectTagDefs) {
      tagKeyByTagId.set(t.tagId, buildExternalKey('tag', t.tagId, t.name, t.color));
    }

    const userIds = visible.map((u) => u.userId);
    const [userTagAssoc, provisionedUsers] = await Promise.all([
      this.exportRepo.getUserTagsByUserIds(userIds, tx),
      this.exportRepo.getProjectCdmProvisionedUsers(ctx.projectId, tx),
    ]);
    const provisionKeyByUserId = new Map<string, string>();
    for (const p of provisionedUsers) {
      const imp = p.metadata['cdmImport'] as { externalKey?: string } | undefined;
      const ext = imp?.externalKey;
      provisionKeyByUserId.set(
        p.userId,
        ext && ext.length > 0 ? ext : buildExternalKey('user', p.userId, p.name)
      );
    }

    const tagKeysByUserId = new Map<string, string[]>();
    const primaryUserTagKeyByUserId = new Map<string, string>();
    for (const a of userTagAssoc) {
      const key = tagKeyByTagId.get(a.tagId);
      if (!key) continue;
      const arr = tagKeysByUserId.get(a.ownerId) ?? [];
      arr.push(key);
      tagKeysByUserId.set(a.ownerId, arr);
      if (a.isPrimary) {
        primaryUserTagKeyByUserId.set(a.ownerId, key);
      }
    }

    return visible.map((u) => {
      const roleTemplateKeys = u.roleIds
        .map((id) => roleKeyById.get(id))
        .filter((k): k is string => Boolean(k));
      const tagKeys = (tagKeysByUserId.get(u.userId) ?? []).slice().sort();
      const userKey = provisionKeyByUserId.get(u.userId);
      const primaryUserTagKey = primaryUserTagKeyByUserId.get(u.userId);
      const base = {
        roleTemplateKeys,
        directPermissionRefs: [],
        metadata: extractProjectUserMetadataForCdmExport(u.metadata),
        tagKeys: tagKeys.length > 0 ? tagKeys : undefined,
        primaryUserTagKey:
          primaryUserTagKey != null && tagKeys.includes(primaryUserTagKey)
            ? primaryUserTagKey
            : undefined,
      };
      if (userKey != null) {
        return { ...base, userKey, userId: undefined };
      }
      return { ...base, userId: u.userId, userKey: undefined };
    });
  }
}

function resolveAssignmentUserId(ua: CdmUserAssignmentInternal, ctx: CdmApplyContext): string {
  if (ua.userId != null && ua.userId !== '') {
    return ua.userId;
  }
  if (ua.userKey != null && ua.userKey !== '') {
    const id = ctx.produced.userIds.get(ua.userKey);
    if (!id) {
      throw new ValidationError(`userAssignments: unresolved userKey '${ua.userKey}'`);
    }
    return id;
  }
  throw new ValidationError('userAssignments: each entry requires userId or userKey');
}
