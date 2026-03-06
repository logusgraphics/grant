/**
 * Project-domain repository port interfaces.
 * Implementations (Drizzle-based) live in apps/api.
 */
import type { DeleteParams, SelectedFields } from './common';
import type {
  AddProjectAppTagInput,
  AddProjectGroupInput,
  AddProjectPermissionInput,
  AddProjectResourceInput,
  AddProjectRoleInput,
  AddProjectTagInput,
  AddProjectUserApiKeyInput,
  AddProjectUserInput,
  CreateProjectAppInput,
  CreateProjectAppResult,
  CreateProjectInput,
  MutationDeleteProjectAppArgs,
  MutationDeleteProjectArgs,
  MutationUpdateProjectArgs,
  Project,
  ProjectApp,
  ProjectAppPage,
  ProjectAppTag,
  ProjectGroup,
  ProjectPage,
  ProjectPermission,
  ProjectResource,
  ProjectRole,
  ProjectTag,
  ProjectUser,
  ProjectUserApiKey,
  QueryProjectAppTagsInput,
  QueryProjectGroupsInput,
  QueryProjectPermissionsInput,
  QueryProjectResourcesInput,
  QueryProjectRolesInput,
  QueryProjectTagsInput,
  QueryProjectUserApiKeysInput,
  QueryProjectUsersInput,
  QueryProjectAppsArgs,
  QueryProjectsArgs,
  RemoveProjectAppTagInput,
  RemoveProjectGroupInput,
  RemoveProjectPermissionInput,
  RemoveProjectResourceInput,
  RemoveProjectRoleInput,
  RemoveProjectTagInput,
  RemoveProjectUserApiKeyInput,
  RemoveProjectUserInput,
  UpdateProjectAppInput,
  UpdateProjectAppTagInput,
  UpdateProjectTagInput,
} from '@grantjs/schema';

export interface IProjectRepository {
  getProjects(
    params: Omit<QueryProjectsArgs, 'scope' | 'tagIds'> & SelectedFields<Project>,
    transaction?: unknown
  ): Promise<ProjectPage>;

  createProject(
    params: Omit<CreateProjectInput, 'scope' | 'tagIds'>,
    transaction?: unknown
  ): Promise<Project>;

  updateProject(params: MutationUpdateProjectArgs, transaction?: unknown): Promise<Project>;

  softDeleteProject(
    params: Omit<MutationDeleteProjectArgs, 'scope'>,
    transaction?: unknown
  ): Promise<Project>;

  hardDeleteProject(
    params: Omit<MutationDeleteProjectArgs, 'scope'>,
    transaction?: unknown
  ): Promise<Project>;
}

export interface IProjectUserRepository {
  getProjectUsers(params: QueryProjectUsersInput, transaction?: unknown): Promise<ProjectUser[]>;

  addProjectUser(params: AddProjectUserInput, transaction?: unknown): Promise<ProjectUser>;

  softDeleteProjectUser(
    params: RemoveProjectUserInput,
    transaction?: unknown
  ): Promise<ProjectUser>;

  hardDeleteProjectUser(
    params: RemoveProjectUserInput,
    transaction?: unknown
  ): Promise<ProjectUser>;

  getProjectUserMemberships(
    userId: string,
    transaction?: unknown
  ): Promise<
    Array<{
      projectId: string;
      projectName: string;
      role: string;
      joinedAt: Date;
    }>
  >;
}

export interface IProjectRoleRepository {
  getProjectRoles(params: QueryProjectRolesInput, transaction?: unknown): Promise<ProjectRole[]>;

  addProjectRole(params: AddProjectRoleInput, transaction?: unknown): Promise<ProjectRole>;

  softDeleteProjectRole(
    params: RemoveProjectRoleInput,
    transaction?: unknown
  ): Promise<ProjectRole>;

  hardDeleteProjectRole(
    params: RemoveProjectRoleInput,
    transaction?: unknown
  ): Promise<ProjectRole>;
}

export interface IProjectGroupRepository {
  getProjectGroups(params: QueryProjectGroupsInput, transaction?: unknown): Promise<ProjectGroup[]>;

  addProjectGroup(params: AddProjectGroupInput, transaction?: unknown): Promise<ProjectGroup>;

  softDeleteProjectGroup(
    params: RemoveProjectGroupInput,
    transaction?: unknown
  ): Promise<ProjectGroup>;

  hardDeleteProjectGroup(
    params: RemoveProjectGroupInput,
    transaction?: unknown
  ): Promise<ProjectGroup>;
}

export interface IProjectPermissionRepository {
  getProjectPermissions(
    params: QueryProjectPermissionsInput,
    transaction?: unknown
  ): Promise<ProjectPermission[]>;

  /** Returns allowed OAuth scope slugs (resource:action) for the project. */
  getScopeSlugsForProject(projectId: string, transaction?: unknown): Promise<string[]>;

  /** Returns permission name and description for each scope slug that exists in the project. */
  getScopeSlugLabelsForProject(
    projectId: string,
    scopeSlugs: string[],
    transaction?: unknown
  ): Promise<{ slug: string; name: string; description: string | null }[]>;

  addProjectPermission(
    params: AddProjectPermissionInput,
    transaction?: unknown
  ): Promise<ProjectPermission>;

  softDeleteProjectPermission(
    params: RemoveProjectPermissionInput,
    transaction?: unknown
  ): Promise<ProjectPermission>;

  hardDeleteProjectPermission(
    params: RemoveProjectPermissionInput,
    transaction?: unknown
  ): Promise<ProjectPermission>;
}

export interface IProjectResourceRepository {
  getProjectResources(
    params: QueryProjectResourcesInput,
    transaction?: unknown
  ): Promise<ProjectResource[]>;

  addProjectResource(
    params: AddProjectResourceInput,
    transaction?: unknown
  ): Promise<ProjectResource>;

  softDeleteProjectResource(
    params: RemoveProjectResourceInput,
    transaction?: unknown
  ): Promise<ProjectResource>;

  hardDeleteProjectResource(
    params: RemoveProjectResourceInput,
    transaction?: unknown
  ): Promise<ProjectResource>;
}

export interface IProjectTagRepository {
  getProjectTags(params: QueryProjectTagsInput, transaction?: unknown): Promise<ProjectTag[]>;

  getProjectTag(params: QueryProjectTagsInput, transaction?: unknown): Promise<ProjectTag>;

  getProjectTagIntersection(projectIds: string[], tagIds: string[]): Promise<ProjectTag[]>;

  addProjectTag(params: AddProjectTagInput, transaction?: unknown): Promise<ProjectTag>;

  updateProjectTag(params: UpdateProjectTagInput, transaction?: unknown): Promise<ProjectTag>;

  softDeleteProjectTag(params: RemoveProjectTagInput, transaction?: unknown): Promise<ProjectTag>;

  hardDeleteProjectTag(params: RemoveProjectTagInput, transaction?: unknown): Promise<ProjectTag>;
}

export interface IProjectAppRepository {
  getProjectApps(
    params: Omit<QueryProjectAppsArgs, 'scope'> &
      SelectedFields<ProjectApp> & { projectId: string } & SelectedFields<ProjectApp>,
    transaction?: unknown
  ): Promise<ProjectAppPage>;

  createProjectApp(
    params: Omit<CreateProjectAppInput, 'scope'> & {
      projectId: string;
      clientSecretHash?: string | null;
    },
    transaction?: unknown
  ): Promise<CreateProjectAppResult>;

  getProjectAppById(id: string, transaction?: unknown): Promise<ProjectApp | null>;

  getProjectAppByClientId(clientId: string, transaction?: unknown): Promise<ProjectApp | null>;

  updateProjectApp(
    params: { id: string; projectId: string } & Omit<UpdateProjectAppInput, 'scope'>,
    transaction?: unknown
  ): Promise<ProjectApp>;

  softDeleteProjectApp(
    params: Omit<MutationDeleteProjectAppArgs, 'scope'> & { projectId: string } & DeleteParams,
    transaction?: unknown
  ): Promise<ProjectApp>;
}

export interface IProjectAppTagRepository {
  getProjectAppTags(
    params: QueryProjectAppTagsInput,
    transaction?: unknown
  ): Promise<ProjectAppTag[]>;

  getProjectAppTagIntersection(
    projectAppIds: string[],
    tagIds: string[],
    transaction?: unknown
  ): Promise<ProjectAppTag[]>;

  addProjectAppTag(params: AddProjectAppTagInput, transaction?: unknown): Promise<ProjectAppTag>;

  updateProjectAppTag(
    params: UpdateProjectAppTagInput,
    transaction?: unknown
  ): Promise<ProjectAppTag>;

  softDeleteProjectAppTag(
    params: RemoveProjectAppTagInput,
    transaction?: unknown
  ): Promise<ProjectAppTag>;

  hardDeleteProjectAppTag(
    params: RemoveProjectAppTagInput,
    transaction?: unknown
  ): Promise<ProjectAppTag>;
}

export interface IProjectUserApiKeyRepository {
  getProjectUserApiKeys(
    params: QueryProjectUserApiKeysInput,
    transaction?: unknown
  ): Promise<ProjectUserApiKey[]>;

  addProjectUserApiKey(
    params: AddProjectUserApiKeyInput,
    transaction?: unknown
  ): Promise<ProjectUserApiKey>;

  softDeleteProjectUserApiKey(
    params: RemoveProjectUserApiKeyInput,
    transaction?: unknown
  ): Promise<ProjectUserApiKey>;

  hardDeleteProjectUserApiKey(
    params: RemoveProjectUserApiKeyInput,
    transaction?: unknown
  ): Promise<ProjectUserApiKey>;
}
