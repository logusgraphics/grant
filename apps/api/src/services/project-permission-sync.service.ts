import type {
  CdmApplyContext,
  CdmPermissionRefSpec,
  CdmProducedRefs,
  IApiKeyService,
  ICdmEntityHandler,
  IGroupPermissionService,
  IGroupService,
  IGroupTagService,
  IPermissionService,
  IPermissionTagService,
  IProjectGroupService,
  IProjectPermissionService,
  IProjectPermissionSyncService,
  IProjectResourceService,
  IProjectRoleService,
  IProjectTagService,
  IProjectUserApiKeyService,
  IProjectUserService,
  IResourceService,
  IResourceTagService,
  IRoleGroupService,
  IRoleService,
  IRoleTagService,
  ITagService,
  IUserRepository,
  IUserRoleService,
  IUserService,
  IUserTagService,
} from '@grantjs/core';
import {
  CdmModeStrategy,
  PermissionCdmInput,
  ResourceCdmInput,
  Scope,
  SyncProjectPermissionsInput,
  SyncProjectPermissionsResult,
  Tenant,
} from '@grantjs/schema';

import { AUTH_RESULT_CACHE_KEY_PREFIX } from '@/constants/cache.constants';
import type { IEntityCacheAdapter } from '@/lib/cache';
import { ConflictError, ValidationError } from '@/lib/errors';
import { Transaction } from '@/lib/transaction-manager.lib';
import { ProjectPermissionExportRepository } from '@/repositories/project-permission-export.repository';
import {
  ProjectPermissionSyncRepository,
  ResolvedCdmPermission,
} from '@/repositories/project-permission-sync.repository';

import { createDefaultCdmHandlers } from './cdm';
import type { ExpandedCdmSyncPayload } from './cdm/expand-cdm-sync-input';
import { expandCdmSyncInput } from './cdm/expand-cdm-sync-input';
import { refDedupKey, resolveAllPermissionRefs } from './cdm/permission-ref.helper';

/**
 * Orchestrator for CDM (canonical data model) permission sync.
 *
 * Owns the cross-cutting concerns common to every CDM entity:
 *   - scope assertion + project-id scope match,
 *   - `version` gate,
 *   - per-handler input validation,
 *   - one-pass permission-ref deduplication and resolution,
 *   - teardown phase (all handlers' teardown runs before any apply),
 *   - apply phase, mutating the shared `result` counters and `produced` refs,
 *   - post-commit cache invalidation.
 *
 * Per-entity logic lives in {@link ICdmEntityHandler}s built by
 * {@link createDefaultCdmHandlers}. To support a new CDM entity (API keys,
 * project apps, etc.) implement the port and add it to the registry — the
 * orchestrator does not need to change.
 */
export class ProjectPermissionSyncService implements IProjectPermissionSyncService {
  private readonly syncRepo: ProjectPermissionSyncRepository;
  private readonly cache: IEntityCacheAdapter;
  private readonly handlers: ReadonlyArray<ICdmEntityHandler>;
  private readonly resourceTags: IResourceTagService;
  private readonly permissionTags: IPermissionTagService;

  constructor(
    syncRepo: ProjectPermissionSyncRepository,
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
    apiKeys: IApiKeyService,
    projectUserApiKeys: IProjectUserApiKeyService,
    cache: IEntityCacheAdapter,
    tags: ITagService,
    projectTags: IProjectTagService,
    roleTags: IRoleTagService,
    groupTags: IGroupTagService,
    userTags: IUserTagService,
    resources: IResourceService,
    permissions: IPermissionService,
    users: IUserService,
    userRepository: IUserRepository,
    resourceTags: IResourceTagService,
    permissionTags: IPermissionTagService,
    /**
     * Read-side repo used by handlers' `export(...)` to enumerate prior
     * project state. Optional because the sync flow itself only needs the
     * registry's `apply`/`teardown`; if omitted, calls into `handler.export`
     * will fail with a missing-dependency error at use-time.
     *
     * Tests that exercise sync only (e.g. metadata round-trip) can omit this
     * argument and pass a stub via {@link handlers} to avoid wiring it.
     */
    exportRepo?: ProjectPermissionExportRepository,
    /**
     * Optional explicit handler registry. When provided, all CDM concerns are
     * delegated to this list; otherwise the default registry is built from the
     * injected services. Useful to add new handlers in tests or to swap a
     * single handler with a mock.
     */
    handlers?: ReadonlyArray<ICdmEntityHandler>
  ) {
    this.syncRepo = syncRepo;
    this.cache = cache;
    this.resourceTags = resourceTags;
    this.permissionTags = permissionTags;
    this.handlers =
      handlers ??
      createDefaultCdmHandlers({
        syncRepo,
        exportRepo: exportRepo ?? createUnboundExportRepo(),
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
        apiKeys,
        projectUserApiKeys,
        tags,
        projectTags,
        roleTags,
        groupTags,
        userTags,
        resources,
        permissions,
        users,
        userRepository,
      });
  }

  /**
   * Post-commit cache invalidation for a successful sync. Mirrors what the
   * legacy synchronous handler used to do; lives on the service so the async
   * worker can call it without depending on transport-layer handlers.
   */
  public async invalidateCachesForSyncResult(params: {
    scope: Scope;
    userIds: string[];
  }): Promise<void> {
    const cacheKey = `${params.scope.tenant}:${params.scope.id}`;
    await Promise.all([
      this.cache.permissions.delete(cacheKey),
      this.cache.roles.delete(cacheKey),
      this.cache.groups.delete(cacheKey),
      this.cache.users.delete(cacheKey),
      this.cache.resources.delete(cacheKey),
      this.cache.tags.delete(cacheKey),
      this.cache.apiKeys.delete(cacheKey),
    ]);

    for (const userId of params.userIds) {
      const pattern = `${AUTH_RESULT_CACHE_KEY_PREFIX}${userId}:*`;
      const keys = await this.cache.permissions.keys(pattern);
      for (const key of keys) {
        await this.cache.permissions.delete(key);
      }
    }
  }

  public async syncProjectPermissions(
    params: {
      projectId: string;
      scope: Scope;
      input: SyncProjectPermissionsInput;
    },
    transaction: unknown
  ): Promise<SyncProjectPermissionsResult> {
    const tx = transaction as Transaction;
    const { projectId, scope, input } = params;
    this.assertProjectScope(scope);
    const scopeProjectId = this.projectIdFromScope(scope);
    if (scopeProjectId !== projectId) {
      throw new ValidationError(
        'scope id must contain the same projectId as the projectId argument'
      );
    }
    const expanded = expandCdmSyncInput(input);
    if (expanded.version !== 1) {
      throw new ValidationError('Unsupported version; only 1 is allowed');
    }

    for (const handler of this.handlers) {
      const slice = this.sliceForHandler(expanded, handler);
      handler.validateInput(slice);
    }

    this.validateCdmUserReferences(expanded);

    const allRefs: CdmPermissionRefSpec[] = [];
    for (const handler of this.handlers) {
      const slice = this.sliceForHandler(expanded, handler);
      const refs = handler.collectPermissionRefs(slice);
      for (const r of refs) allRefs.push(r);
    }
    const resolvedByKey = await resolveAllPermissionRefs(this.syncRepo, allRefs, tx);

    const result: SyncProjectPermissionsResult = {
      projectId,
      importId: expanded.id ?? null,
      rolesCreated: 0,
      groupsCreated: 0,
      roleGroupsLinked: 0,
      groupPermissionsLinked: 0,
      projectRolesLinked: 0,
      projectGroupsLinked: 0,
      projectPermissionsLinked: 0,
      projectResourcesLinked: 0,
      projectUsersEnsured: 0,
      usersCreated: 0,
      userRolesAssigned: 0,
      projectUserApiKeysCreated: 0,
      tagsCreated: 0,
      projectTagsLinked: 0,
      roleTagsLinked: 0,
      groupTagsLinked: 0,
      userTagsLinked: 0,
      resourcesCreated: 0,
      permissionsCreated: 0,
      warnings: [],
    };

    const produced: CdmProducedRefs = {
      roleIdsByKey: new Map<string, string>(),
      tagIds: new Map<string, string>(),
      resourceIds: new Map<string, string>(),
      permissionIds: new Map<string, string>(),
      userIds: new Map<string, string>(),
    };

    if (expanded.mode?.strategy === CdmModeStrategy.Replace) {
      if (expanded.mode.confirmDestructive !== true) {
        throw new ValidationError(
          'mode.confirmDestructive must be true when mode.strategy is replace'
        );
      }
      for (const handler of this.handlers) {
        await handler.teardown({ projectId, scope, tx });
      }
    }

    const assignmentUserIds = new Set<string>();
    for (const ua of expanded.userAssignments ?? []) {
      if (ua.userId != null && ua.userId !== '') {
        assignmentUserIds.add(ua.userId);
      }
    }

    const applyCtx: CdmApplyContext = {
      projectId,
      scope,
      tx,
      lookupResolvedRef: (ref) => this.lookupRef(ref, resolvedByKey, produced),
      result,
      produced,
      assignmentUserIds,
    };

    for (const handler of this.handlers) {
      const slice = this.sliceForHandler(expanded, handler);
      await handler.apply(applyCtx, slice);
    }

    await this.linkResourceAndPermissionTagPivots(expanded, applyCtx, tx);

    return result;
  }

  /**
   * After {@link TagHandler} has populated `produced.tagIds`, attach
   * `resource_tags` / `permission_tags` from the CDM document. Handlers run
   * resource (2) and permission (4) before tags (5), so pivots are linked here.
   */
  private async linkResourceAndPermissionTagPivots(
    expanded: ExpandedCdmSyncPayload,
    ctx: CdmApplyContext,
    tx: Transaction
  ): Promise<void> {
    const { produced } = ctx;
    for (const row of expanded.resources) {
      const r = row as ResourceCdmInput;
      const key = r.key?.trim() ?? '';
      const resourceId = produced.resourceIds.get(key);
      if (!resourceId) continue;
      const tagKeys = (r.tags ?? []).filter(
        (t): t is string => typeof t === 'string' && t.trim() !== ''
      );
      for (const tagKey of tagKeys) {
        const tk = tagKey.trim();
        const tagId = produced.tagIds.get(tk);
        if (!tagId) {
          throw new ValidationError(`resources[${key}]: unknown tagKey '${tk}'`);
        }
        const isPrimary = tk === (r.primaryTag?.trim() ?? '');
        try {
          await this.resourceTags.addResourceTag({ resourceId, tagId, isPrimary }, tx);
        } catch (e) {
          if (!(e instanceof ConflictError)) throw e;
        }
      }
    }
    for (const row of expanded.permissions) {
      const p = row as PermissionCdmInput;
      const key = p.key?.trim() ?? '';
      const permissionId = produced.permissionIds.get(key);
      if (!permissionId) continue;
      const tagKeys = (p.tags ?? []).filter(
        (t): t is string => typeof t === 'string' && t.trim() !== ''
      );
      for (const tagKey of tagKeys) {
        const tk = tagKey.trim();
        const tagId = produced.tagIds.get(tk);
        if (!tagId) {
          throw new ValidationError(`permissions[${key}]: unknown tagKey '${tk}'`);
        }
        const isPrimary = tk === (p.primaryTag?.trim() ?? '');
        try {
          await this.permissionTags.addPermissionTag({ permissionId, tagId, isPrimary }, tx);
        } catch (e) {
          if (!(e instanceof ConflictError)) throw e;
        }
      }
    }
  }

  /**
   * Read the array slice owned by a handler off the expanded CDM payload.
   */
  private sliceForHandler(
    expanded: ExpandedCdmSyncPayload,
    handler: ICdmEntityHandler
  ): readonly unknown[] {
    const value = (expanded as unknown as Record<string, unknown>)[handler.inputKey];
    return Array.isArray(value) ? (value as readonly unknown[]) : [];
  }

  /**
   * Resolve a permission ref at apply time.
   *
   * Resolution order:
   * 1. `permissionKey` against `produced.permissionIds` — for permissions
   *    declared in this same CDM document by the {@link PermissionHandler}.
   *    Resource linkage is already established by the resource/permission
   *    handlers, so we return `resourceId: null` to skip the
   *    {@link CdmEntityBuilder}'s redundant project_resources idempotency check.
   * 2. Pre-resolved entry from `resolved` (slug+action [+condition], or
   *    `permissionId` against the global catalog).
   */
  private lookupRef(
    ref: CdmPermissionRefSpec,
    resolved: Map<string, ResolvedCdmPermission>,
    produced: CdmProducedRefs
  ): ResolvedCdmPermission {
    if (ref.permissionKey != null && ref.permissionKey !== '') {
      const id = produced.permissionIds.get(ref.permissionKey);
      if (id) {
        return { id, resourceId: null };
      }
      throw new ValidationError(
        `permissionKey "${ref.permissionKey}" did not match any permission in the CDM document`
      );
    }
    const key = refDedupKey(ref);
    const v = resolved.get(key);
    if (!v) {
      throw new ValidationError('Internal: missing resolved permission for ref');
    }
    return v;
  }

  private assertProjectScope(scope: Scope): void {
    if (scope.tenant !== Tenant.AccountProject && scope.tenant !== Tenant.OrganizationProject) {
      throw new ValidationError(
        'syncProjectPermissions requires accountProject or organizationProject scope'
      );
    }
  }

  private projectIdFromScope(scope: Scope): string {
    const parts = scope.id.split(':');
    return parts[1] ?? '';
  }

  /**
   * Cross-field validation for expanded user assignments and API keys vs provisioned users.
   */
  private validateCdmUserReferences(expanded: ExpandedCdmSyncPayload): void {
    const provisionKeys = new Set(expanded.provisionedUsers.map((p) => p.externalKey));
    const assignmentSeen = new Set<string>();
    for (const ua of expanded.userAssignments ?? []) {
      const hasUid = ua.userId != null && ua.userId !== '';
      const hasKey = ua.userKey != null && ua.userKey !== '';
      if (hasUid === hasKey) {
        throw new ValidationError(
          'Each user entry requires exactly one of key.findBy id or a provision key'
        );
      }
      if (hasKey && !provisionKeys.has(ua.userKey!)) {
        throw new ValidationError(
          `users: unknown provision key '${ua.userKey}'; must match another user's key when not using id lookup`
        );
      }
      const dedupe = hasUid ? ua.userId! : `key:${ua.userKey}`;
      if (assignmentSeen.has(dedupe)) {
        throw new ValidationError(`Duplicate user entry for ${dedupe}`);
      }
      assignmentSeen.add(dedupe);
      if (ua.primaryUserTagKey != null && ua.primaryUserTagKey !== '') {
        const tags = ua.tagKeys ?? [];
        if (!tags.includes(ua.primaryUserTagKey)) {
          throw new ValidationError(
            `users: primaryTag '${ua.primaryUserTagKey}' must appear in tags`
          );
        }
      }
    }

    for (const row of expanded.projectUserApiKeys ?? []) {
      const hasUid = row.userId != null && row.userId !== '';
      const hasKey = row.userKey != null && row.userKey !== '';
      if (hasUid === hasKey) {
        throw new ValidationError(
          'Each apiKeys entry requires exactly one of userId or userKey on the parent user'
        );
      }
      if (hasKey && !provisionKeys.has(row.userKey!)) {
        throw new ValidationError(
          `apiKeys: unknown userKey '${row.userKey}'; parent user must be provisioned in the same document`
        );
      }
    }
  }
}

/**
 * Sentinel export repository used when callers construct the sync service
 * without wiring the read-side join repo. Every method throws — handlers'
 * `export(...)` paths surface a clear missing-dependency error instead of
 * silently using `undefined.db`.
 */
function createUnboundExportRepo(): ProjectPermissionExportRepository {
  const fail = () => {
    throw new Error(
      'ProjectPermissionExportRepository was not provided to ProjectPermissionSyncService; export(...) is unavailable in this configuration.'
    );
  };
  return new Proxy(Object.create(null) as ProjectPermissionExportRepository, {
    get: () => fail,
  });
}
