import type {
  IApiKeyService,
  ICdmEntityHandler,
  IGroupPermissionService,
  IGroupService,
  IGroupTagService,
  IPermissionService,
  IProjectGroupService,
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

import type { ProjectPermissionExportRepository } from '@/repositories/project-permission-export.repository';
import type { ProjectSyncRepository } from '@/repositories/project-sync.repository';

import { CdmEntityBuilder } from './cdm-entity-builder';
import { PermissionHandler } from './permission.handler';
import { ProjectUserApiKeyCdmHandler } from './project-user-api-key.handler';
import { ResourceHandler } from './resource.handler';
import { RoleTemplateHandler } from './role-template.handler';
import { TagHandler } from './tag.handler';
import { UserAssignmentHandler } from './user-assignment.handler';
import { UserProvisionHandler } from './user-provision.handler';

export type { CdmRoleWithGroupNaming } from './cdm-entity-builder';
export { CdmEntityBuilder } from './cdm-entity-builder';
export { assembleExportedSyncProjectInput } from './cdm-export-assemble';
export {
  addPermissionRefDeduped,
  canonicalPermissionDocumentString,
  parseCdmPermissionDocumentString,
  serializePermissionRefForCdmDocument,
} from './cdm-permission-document-ref';
export type { CdmExternalKeyKind } from './identity.helper';
export { buildExternalKey, stableHash } from './identity.helper';
export {
  isPermissionKeyOnlyRef,
  refDedupKey,
  resolveAllPermissionRefs,
  resolveSinglePermissionRef,
} from './permission-ref.helper';
export { ResourceHandler } from './resource.handler';
export { RoleTemplateHandler } from './role-template.handler';
export { TagHandler } from './tag.handler';
export { UserAssignmentHandler } from './user-assignment.handler';
export { UserProvisionHandler } from './user-provision.handler';

/**
 * Bag of services injected into the default CDM handlers. Centralised here so
 * the orchestrator (sync service) and the export service share the same
 * registry construction and we don't drift in handler ordering.
 */
export interface CdmHandlerRegistryDeps {
  syncRepo: ProjectSyncRepository;
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
  tags: ITagService;
  projectTags: IProjectTagService;
  roleTags: IRoleTagService;
  groupTags: IGroupTagService;
  userTags: IUserTagService;
  resources: IResourceService;
  permissions: IPermissionService;
  users: IUserService;
  userRepository: IUserRepository;
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
    new ResourceHandler(deps.syncRepo, deps.exportRepo, deps.resources, deps.projectResources),
    new PermissionHandler(
      deps.syncRepo,
      deps.exportRepo,
      deps.permissions,
      deps.projectPermissions,
      deps.resources
    ),
    new TagHandler(deps.syncRepo, deps.exportRepo, deps.tags, deps.projectTags),
    new RoleTemplateHandler(deps.syncRepo, deps.exportRepo, builder, deps.roleTags, deps.groupTags),
    new UserProvisionHandler(deps.exportRepo, deps.users, deps.userRepository),
    new UserAssignmentHandler(
      deps.exportRepo,
      builder,
      deps.projectUsers,
      deps.userRoles,
      deps.userTags
    ),
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
