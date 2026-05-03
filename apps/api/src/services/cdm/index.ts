import type {
  IApiKeyService,
  ICdmEntityHandler,
  IGroupPermissionService,
  IGroupService,
  IProjectGroupService,
  IProjectPermissionService,
  IProjectResourceService,
  IProjectRoleService,
  IProjectUserApiKeyService,
  IProjectUserService,
  IRoleGroupService,
  IRoleService,
  IUserRoleService,
} from '@grantjs/core';

import type { ProjectPermissionExportRepository } from '@/repositories/project-permission-export.repository';
import type { ProjectPermissionSyncRepository } from '@/repositories/project-permission-sync.repository';

import { CdmEntityBuilder } from './cdm-entity-builder';
import { ProjectUserApiKeyCdmHandler } from './project-user-api-key.handler';
import { RoleTemplateHandler } from './role-template.handler';
import { UserAssignmentHandler } from './user-assignment.handler';

export { CdmEntityBuilder } from './cdm-entity-builder';
export {
  refDedupKey,
  resolveAllPermissionRefs,
  resolveSinglePermissionRef,
} from './permission-ref.helper';
export { RoleTemplateHandler } from './role-template.handler';
export { UserAssignmentHandler } from './user-assignment.handler';

/**
 * Bag of services injected into the default CDM handlers. Centralised here so
 * the orchestrator (sync service) and the export service share the same
 * registry construction and we don't drift in handler ordering.
 */
export interface CdmHandlerRegistryDeps {
  syncRepo: ProjectPermissionSyncRepository;
  exportRepo: ProjectPermissionExportRepository;
  roles: IRoleService;
  groups: IGroupService;
  roleGroups: IRoleGroupService;
  groupPermissions: IGroupPermissionService;
  projectRoles: IProjectRoleService;
  projectGroups: IProjectGroupService;
  projectPermissions: IProjectPermissionService;
  projectResources: IProjectResourceService;
  projectUsers: IProjectUserService;
  userRoles: IUserRoleService;
  apiKeys: IApiKeyService;
  projectUserApiKeys: IProjectUserApiKeyService;
}

/**
 * Build the default ordered registry of CDM entity handlers for v1.
 *
 * To extend the CDM (e.g. add API keys), implement `ICdmEntityHandler` for
 * the new entity, push it into this array (or compose a new factory that
 * accepts additional deps), and ensure its `order` reflects its position in
 * the dependency graph relative to the existing handlers.
 *
 * The returned array is sorted by `order` and frozen so callers can't
 * accidentally mutate registry state mid-pipeline.
 */
export function createDefaultCdmHandlers(
  deps: CdmHandlerRegistryDeps
): ReadonlyArray<ICdmEntityHandler> {
  const builder = new CdmEntityBuilder(
    deps.syncRepo,
    deps.roles,
    deps.groups,
    deps.roleGroups,
    deps.groupPermissions,
    deps.projectRoles,
    deps.projectGroups,
    deps.projectPermissions,
    deps.projectResources,
    deps.userRoles
  );

  const handlers: ICdmEntityHandler[] = [
    new RoleTemplateHandler(deps.syncRepo, deps.exportRepo, builder),
    new UserAssignmentHandler(deps.exportRepo, builder, deps.projectUsers, deps.userRoles),
    new ProjectUserApiKeyCdmHandler(
      deps.syncRepo,
      deps.exportRepo,
      deps.apiKeys,
      deps.projectUserApiKeys
    ),
  ];

  handlers.sort((a, b) => a.order - b.order);
  return Object.freeze(handlers);
}
