import type {
  CdmApplyContext,
  CdmPermissionRefSpec,
  CdmProducedRefs,
  IApiKeyService,
  ICdmEntityHandler,
  IGroupPermissionService,
  IGroupService,
  IGroupTagService,
  IProjectGroupService,
  IProjectPermissionService,
  IProjectPermissionSyncService,
  IProjectResourceService,
  IProjectRoleService,
  IProjectTagService,
  IProjectUserApiKeyService,
  IProjectUserService,
  IRoleGroupService,
  IRoleService,
  IRoleTagService,
  ITagService,
  IUserRoleService,
  IUserTagService,
} from '@grantjs/core';
import {
  Scope,
  SyncProjectPermissionsInput,
  SyncProjectPermissionsResult,
  Tenant,
} from '@grantjs/schema';

import { AUTH_RESULT_CACHE_KEY_PREFIX } from '@/constants/cache.constants';
import type { IEntityCacheAdapter } from '@/lib/cache';
import { ValidationError } from '@/lib/errors';
import { Transaction } from '@/lib/transaction-manager.lib';
import { ProjectPermissionExportRepository } from '@/repositories/project-permission-export.repository';
import {
  ProjectPermissionSyncRepository,
  ResolvedCdmPermission,
} from '@/repositories/project-permission-sync.repository';

import { createDefaultCdmHandlers } from './cdm';
import { refDedupKey, resolveAllPermissionRefs } from './cdm/permission-ref.helper';

/**
 * Orchestrator for CDM (canonical data model) permission sync.
 *
 * Owns the cross-cutting concerns common to every CDM entity:
 *   - scope assertion + project-id scope match,
 *   - `cdmVersion` gate,
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
    if (input.cdmVersion !== 1) {
      throw new ValidationError('Unsupported cdmVersion; only 1 is allowed');
    }

    for (const handler of this.handlers) {
      const slice = this.sliceForHandler(input, handler);
      handler.validateInput(slice);
    }

    const allRefs: CdmPermissionRefSpec[] = [];
    for (const handler of this.handlers) {
      const slice = this.sliceForHandler(input, handler);
      const refs = handler.collectPermissionRefs(slice);
      for (const r of refs) allRefs.push(r);
    }
    const resolvedByKey = await resolveAllPermissionRefs(this.syncRepo, allRefs, tx);

    const result: SyncProjectPermissionsResult = {
      projectId,
      importId: input.importId ?? null,
      rolesCreated: 0,
      groupsCreated: 0,
      roleGroupsLinked: 0,
      groupPermissionsLinked: 0,
      projectRolesLinked: 0,
      projectGroupsLinked: 0,
      projectPermissionsLinked: 0,
      projectResourcesLinked: 0,
      projectUsersEnsured: 0,
      userRolesAssigned: 0,
      projectUserApiKeysCreated: 0,
      tagsCreated: 0,
      projectTagsLinked: 0,
      roleTagsLinked: 0,
      groupTagsLinked: 0,
      userTagsLinked: 0,
      warnings: [],
    };

    const produced: CdmProducedRefs = {
      roleTemplateIds: new Map<string, string>(),
      tagIds: new Map<string, string>(),
    };

    for (const handler of this.handlers) {
      await handler.teardown({ projectId, scope, tx });
    }

    const assignmentUserIds = new Set(
      (input.userAssignments ?? []).map((ua) => ua.userId).filter(Boolean)
    );

    const applyCtx: CdmApplyContext = {
      projectId,
      scope,
      tx,
      lookupResolvedRef: (ref) => this.lookupRef(ref, resolvedByKey),
      result,
      produced,
      assignmentUserIds,
    };

    for (const handler of this.handlers) {
      const slice = this.sliceForHandler(input, handler);
      await handler.apply(applyCtx, slice);
    }

    return result;
  }

  /**
   * Read the array slice owned by a handler off the canonical input shape.
   * Returns an empty array when the field is absent or non-array — handlers
   * receive a stable readonly array regardless of upstream optionality.
   */
  private sliceForHandler(
    input: SyncProjectPermissionsInput,
    handler: ICdmEntityHandler
  ): readonly unknown[] {
    const value = (input as unknown as Record<string, unknown>)[handler.inputKey];
    return Array.isArray(value) ? (value as readonly unknown[]) : [];
  }

  private lookupRef(
    ref: CdmPermissionRefSpec,
    resolved: Map<string, ResolvedCdmPermission>
  ): ResolvedCdmPermission {
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
