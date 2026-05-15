import type {
  CdmExportContext,
  IApiKeyService,
  ICdmEntityHandler,
  IGroupPermissionService,
  IGroupService,
  IGroupTagService,
  IPermissionService,
  IProjectGroupService,
  IProjectPermissionExportService,
  IProjectPermissionService,
  IProjectResourceService,
  IProjectRoleService,
  IProjectTagService,
  IProjectUserApiKeyService,
  IProjectUserService,
  IResourceService,
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
  CDM_EXPORT_SECTIONS,
  type CdmExportSection,
  type CdmHandlerInputKey,
  CdmModeStrategy,
  CdmOnConflict,
  Scope,
  SyncProjectInput,
  Tenant,
} from '@grantjs/schema';

import { ValidationError } from '@/lib/errors';
import { Transaction } from '@/lib/transaction-manager.lib';
import type { ProjectPermissionExportRepository } from '@/repositories/project-permission-export.repository';
import type { ProjectSyncRepository } from '@/repositories/project-sync.repository';

import { assembleExportedSyncProjectInput, createDefaultCdmHandlers } from './cdm';
import type {
  CdmProjectUserApiKeyInternal,
  CdmRoleTemplateInternal,
  CdmUserAssignmentInternal,
  CdmUserProvisionInternal,
} from './cdm/cdm-internal.types';

function exportHandlerIncluded(
  includeAll: boolean,
  include: Set<string>,
  key: CdmHandlerInputKey,
  includeUserApiKeys: boolean
): boolean {
  if (key === 'projectUserApiKeys') {
    if (includeAll) return includeUserApiKeys;
    return include.has('users') && includeUserApiKeys;
  }
  if (includeAll) return true;
  switch (key) {
    case 'resources':
      return include.has('resources');
    case 'permissions':
      return include.has('permissions');
    case 'tags':
      return include.has('tags');
    case 'roleTemplates':
      return include.has('roles') || include.has('groups');
    case 'provisionedUsers':
    case 'userAssignments':
      return include.has('users');
    default:
      return false;
  }
}

/**
 * Inverse of {@link ProjectSyncService}: snapshots the project's
 * current permission/role/group/user-assignment state and packages it as a
 * replay-ready `SyncProjectInput`.
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
  private readonly exportRepo: ProjectPermissionExportRepository;

  constructor(
    syncRepo: ProjectSyncRepository,
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
    apiKeys: IApiKeyService,
    projectUserApiKeys: IProjectUserApiKeyService,
    tags: ITagService,
    projectTags: IProjectTagService,
    roleTags: IRoleTagService,
    groupTags: IGroupTagService,
    userTags: IUserTagService,
    resources: IResourceService,
    permissions: IPermissionService,
    users: IUserService,
    userRepository: IUserRepository,
    handlers?: ReadonlyArray<ICdmEntityHandler>
  ) {
    this.exportRepo = exportRepo;
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

  public async exportProjectPermissions(
    params: {
      projectId: string;
      scope: Scope;
      version?: number;
      cdmVersion?: number;
      sections?: readonly CdmExportSection[];
      /** Default true when omitted (sync rollback snapshot). */
      includeUserApiKeys?: boolean;
      mode?: {
        strategy: 'merge' | 'replace';
        onConflict?: 'fail' | 'skip' | 'update' | null;
        confirmDestructive?: boolean;
      };
    },
    transaction?: unknown
  ): Promise<SyncProjectInput> {
    this.assertProjectScope(params.scope);
    const scopeProjectId = this.projectIdFromScope(params.scope);
    if (scopeProjectId !== params.projectId) {
      throw new ValidationError(
        'scope id must contain the same projectId as the projectId argument'
      );
    }
    const version = params.version ?? params.cdmVersion ?? 1;
    if (version !== 1) {
      throw new ValidationError('Unsupported version; only 1 is allowed');
    }

    const tx = transaction as Transaction | undefined;

    const documentId = await this.exportRepo.getProjectNameForCdmDocument(params.projectId, tx);

    const exportCtx: CdmExportContext = {
      projectId: params.projectId,
      scope: params.scope,
      tx,
    };

    const modeStrategy =
      params.mode?.strategy === 'replace' ? CdmModeStrategy.Replace : CdmModeStrategy.Merge;
    const onConflict = this.resolveExportOnConflict(params.mode?.onConflict);

    const result: SyncProjectInput = {
      version,
      id: documentId,
      mode: {
        strategy: modeStrategy,
        onConflict,
        confirmDestructive: params.mode?.confirmDestructive ?? false,
      },
      roles: [],
      users: [],
      groups: [],
      tags: [],
      resources: [],
      permissions: [],
    };

    const includeAll = params.sections == null || params.sections.length === 0;
    const include = includeAll
      ? new Set<string>(CDM_EXPORT_SECTIONS)
      : new Set<string>(params.sections);

    const includeUserApiKeys = params.includeUserApiKeys ?? true;

    const slices: Partial<Record<CdmHandlerInputKey, readonly unknown[]>> = {};

    for (const handler of this.handlers) {
      if (!exportHandlerIncluded(includeAll, include, handler.inputKey, includeUserApiKeys)) {
        continue;
      }
      slices[handler.inputKey] = await handler.export(exportCtx);
    }

    const roleTemplates = (slices.roleTemplates ?? []) as readonly CdmRoleTemplateInternal[];
    const userAssignments = (slices.userAssignments ?? []) as readonly CdmUserAssignmentInternal[];
    const projectUserApiKeys = (slices.projectUserApiKeys ??
      []) as readonly CdmProjectUserApiKeyInternal[];
    const provisionedUsers = (slices.provisionedUsers ?? []) as readonly CdmUserProvisionInternal[];

    const assembled = assembleExportedSyncProjectInput({
      roleTemplates,
      userAssignments,
      projectUserApiKeys,
      provisionedUsers,
      resourcesSlice: (slices.resources ?? []) as NonNullable<SyncProjectInput['resources']>,
      permissionsSlice: (slices.permissions ?? []) as NonNullable<SyncProjectInput['permissions']>,
      tagsSlice: (slices.tags ?? []) as NonNullable<SyncProjectInput['tags']>,
    });
    result.roles = assembled.roles;
    result.users = assembled.users;
    result.groups = assembled.groups;
    result.resources = assembled.resources;
    result.permissions = assembled.permissions;
    result.tags = assembled.tags;

    return result;
  }

  private resolveExportOnConflict(
    value: 'fail' | 'skip' | 'update' | null | undefined
  ): CdmOnConflict | null {
    if (value == null) return null;
    if (value === 'fail') return CdmOnConflict.Fail;
    if (value === 'skip') return CdmOnConflict.Skip;
    if (value === 'update') return CdmOnConflict.Update;
    return null;
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
