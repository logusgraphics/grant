/**
 * Project-domain service port interfaces.
 * Covers: Project, ProjectUser, ProjectRole, ProjectGroup,
 *         ProjectPermission, ProjectResource, ProjectTag,
 *         ProjectUserApiKey, ProjectPermissionSync (CDM import).
 */
import type {
  AddProjectGroupInput,
  AddProjectPermissionInput,
  AddProjectResourceInput,
  AddProjectRoleInput,
  AddProjectTagInput,
  AddProjectUserInput,
  CdmExportSection,
  CreateProjectInput,
  MutationDeleteProjectArgs,
  MutationUpdateProjectArgs,
  Project,
  ProjectGroup,
  ProjectPage,
  ProjectPermission,
  ProjectResource,
  ProjectRole,
  ProjectSyncJob,
  ProjectSyncJobPage,
  ProjectSyncJobSortInput,
  ProjectSyncJobStatus,
  ProjectTag,
  ProjectUser,
  ProjectUserApiKey,
  QueryProjectPermissionsInput,
  QueryProjectResourcesInput,
  QueryProjectsArgs,
  RemoveProjectGroupInput,
  RemoveProjectPermissionInput,
  RemoveProjectResourceInput,
  RemoveProjectRoleInput,
  RemoveProjectTagInput,
  RemoveProjectUserInput,
  Scope,
  SyncProjectInput,
  SyncProjectResult,
  UpdateProjectTagInput,
} from '@grantjs/schema';

import type { SelectedFields } from '../repositories/common';
import type { DeleteParams } from './user.service.port';

// ---------------------------------------------------------------------------
// IProjectService
// ---------------------------------------------------------------------------

export interface IProjectService {
  getProjects(
    params: Omit<QueryProjectsArgs, 'scope' | 'tagIds'> & SelectedFields<Project>
  ): Promise<ProjectPage>;

  createProject(
    params: Omit<CreateProjectInput, 'scope' | 'tagIds'>,
    transaction?: unknown
  ): Promise<Project>;

  updateProject(params: MutationUpdateProjectArgs, transaction?: unknown): Promise<Project>;

  deleteProject(
    params: Omit<MutationDeleteProjectArgs, 'scope'> & DeleteParams,
    transaction?: unknown
  ): Promise<Project>;
}

// ---------------------------------------------------------------------------
// IProjectUserService
// ---------------------------------------------------------------------------

export interface IProjectUserService {
  getProjectUsers(
    params: { projectId?: string; userId?: string },
    transaction?: unknown
  ): Promise<ProjectUser[]>;

  addProjectUser(params: AddProjectUserInput, transaction?: unknown): Promise<ProjectUser>;

  mergeProjectUserCdmMetadata(
    params: {
      projectId: string;
      userId: string;
      importerMetadata: Record<string, unknown> | null | undefined;
    },
    transaction?: unknown
  ): Promise<ProjectUser>;

  updateProjectUserMetadata(
    params: {
      projectId: string;
      userId: string;
      metadata: Record<string, unknown>;
    },
    transaction?: unknown
  ): Promise<ProjectUser>;

  updateProjectUserProfile(
    params: {
      projectId: string;
      userId: string;
      displayName?: string | null;
      pictureUrl?: string | null;
    },
    transaction?: unknown
  ): Promise<ProjectUser>;

  removeProjectUser(
    params: RemoveProjectUserInput & DeleteParams,
    transaction?: unknown
  ): Promise<ProjectUser>;

  getUserProjectMemberships(
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

// ---------------------------------------------------------------------------
// IProjectRoleService
// ---------------------------------------------------------------------------

export interface IProjectRoleService {
  getProjectRoles(params: { projectId: string }, transaction?: unknown): Promise<ProjectRole[]>;

  addProjectRole(params: AddProjectRoleInput, transaction?: unknown): Promise<ProjectRole>;

  removeProjectRole(
    params: RemoveProjectRoleInput & DeleteParams,
    transaction?: unknown
  ): Promise<ProjectRole>;
}

// ---------------------------------------------------------------------------
// IProjectGroupService
// ---------------------------------------------------------------------------

export interface IProjectGroupService {
  getProjectGroups(params: { projectId: string }, transaction?: unknown): Promise<ProjectGroup[]>;

  addProjectGroup(params: AddProjectGroupInput, transaction?: unknown): Promise<ProjectGroup>;

  removeProjectGroup(
    params: RemoveProjectGroupInput & DeleteParams,
    transaction?: unknown
  ): Promise<ProjectGroup>;
}

// ---------------------------------------------------------------------------
// IProjectPermissionService
// ---------------------------------------------------------------------------

export interface IProjectPermissionService {
  getProjectPermissions(
    params: QueryProjectPermissionsInput,
    transaction?: unknown
  ): Promise<ProjectPermission[]>;

  /** Returns allowed OAuth scope slugs (resource:action) for the project. */
  getAllowedScopeSlugsForProject(projectId: string, transaction?: unknown): Promise<string[]>;

  /** Returns name and description for each scope slug that exists in the project. */
  getScopeSlugLabelsForProject(
    projectId: string,
    scopeSlugs: string[],
    transaction?: unknown
  ): Promise<{ slug: string; name: string; description: string | null }[]>;

  addProjectPermission(
    params: AddProjectPermissionInput,
    transaction?: unknown
  ): Promise<ProjectPermission>;

  removeProjectPermission(
    params: RemoveProjectPermissionInput & DeleteParams,
    transaction?: unknown
  ): Promise<ProjectPermission>;
}

// ---------------------------------------------------------------------------
// IProjectResourceService
// ---------------------------------------------------------------------------

export interface IProjectResourceService {
  getProjectResources(
    params: QueryProjectResourcesInput,
    transaction?: unknown
  ): Promise<ProjectResource[]>;

  getProjectResourcesByResourceId(
    resourceId: string,
    transaction?: unknown
  ): Promise<ProjectResource[]>;

  addProjectResource(
    params: AddProjectResourceInput,
    transaction?: unknown
  ): Promise<ProjectResource>;

  removeProjectResource(
    params: RemoveProjectResourceInput & DeleteParams,
    transaction?: unknown
  ): Promise<ProjectResource>;
}

// ---------------------------------------------------------------------------
// IProjectTagService
// ---------------------------------------------------------------------------

export interface IProjectTagService {
  getProjectTags(params: { projectId: string }, transaction?: unknown): Promise<ProjectTag[]>;

  getProjectTagIntersection(projectIds: string[], tagIds: string[]): Promise<ProjectTag[]>;

  addProjectTag(params: AddProjectTagInput, transaction?: unknown): Promise<ProjectTag>;

  updateProjectTag(params: UpdateProjectTagInput, transaction?: unknown): Promise<ProjectTag>;

  removeProjectTag(
    params: RemoveProjectTagInput & DeleteParams,
    transaction?: unknown
  ): Promise<ProjectTag>;
}

// ---------------------------------------------------------------------------
// IProjectUserApiKeyService
// ---------------------------------------------------------------------------

export interface IProjectUserApiKeyService {
  getProjectUserApiKeys(
    params: { projectId: string; userId: string },
    transaction?: unknown
  ): Promise<ProjectUserApiKey[]>;

  addProjectUserApiKey(
    params: {
      projectId: string;
      userId: string;
      apiKeyId: string;
      metadata?: Record<string, unknown> | null;
    },
    transaction?: unknown
  ): Promise<ProjectUserApiKey>;

  removeProjectUserApiKey(
    params: { projectId: string; userId: string; apiKeyId: string } & DeleteParams,
    transaction?: unknown
  ): Promise<ProjectUserApiKey>;
}

// ---------------------------------------------------------------------------
// IProjectSyncService
// ---------------------------------------------------------------------------

/** Replace-import of project RBAC from the canonical data model (CDM). */
export interface IProjectSyncService {
  syncProject(
    params: {
      projectId: string;
      scope: Scope;
      input: SyncProjectInput;
    },
    transaction: unknown
  ): Promise<SyncProjectResult>;

  /**
   * Post-commit cache invalidation for a successful sync. Invalidates
   * scope-keyed caches (permissions/roles/groups/users/resources) and the
   * authorization cache for every user touched by the import.
   * Called by both the request-thread handler (legacy) and the async worker.
   */
  invalidateCachesForSyncResult(params: { scope: Scope; userIds: string[] }): Promise<void>;
}

// ---------------------------------------------------------------------------
// IProjectPermissionExportService
// ---------------------------------------------------------------------------

/**
 * Inverse of {@link IProjectSyncService}: snapshot the project's
 * current permission/role/group/user-assignment state and package it as a
 * replay-ready `SyncProjectInput` (the CDM canonical artifact).
 *
 * Used both by the standalone export endpoint (clone-a-project, manual
 * backups) and by the sync worker to capture a pre-import rollback snapshot
 * inside the import transaction.
 */
export interface IProjectPermissionExportService {
  exportProjectPermissions(
    params: {
      projectId: string;
      scope: Scope;
      version?: number;
      cdmVersion?: number;
      /**
       * When set and non-empty, only these CDM slices are exported; others are
       * empty arrays. Omit or pass empty for a full snapshot (sync worker).
       */
      sections?: readonly CdmExportSection[];
    },
    transaction?: unknown
  ): Promise<SyncProjectInput>;
}

// ---------------------------------------------------------------------------
// IProjectSyncJobService
// ---------------------------------------------------------------------------

/**
 * Worker-internal view of a sync job, including the request payload + scope
 * preserved at enqueue time. Returned only by `loadForExecution` so the
 * payload + scope never leak through the public `getById` (GraphQL) path.
 */
export interface ProjectSyncJobExecutionData {
  job: ProjectSyncJob;
  payload: SyncProjectInput;
  scope: Scope;
  /** Whether `cancel()` has been invoked while the job was RUNNING. */
  cancelRequested: boolean;
}

/**
 * State-machine service for the async CDM sync job-tracking row.
 * Owns persistence + transitions only; never performs the import itself.
 * The actual import is delegated to {@link IProjectSyncService}.
 */
export interface IProjectSyncJobService {
  create(
    params: {
      projectId: string;
      scope: Scope;
      cdmVersion: number;
      importId: string | null;
      payload: SyncProjectInput;
      enqueuedById: string;
    },
    transaction?: unknown
  ): Promise<ProjectSyncJob>;

  getById(
    params: { projectId: string; jobId: string },
    transaction?: unknown
  ): Promise<ProjectSyncJob>;

  /**
   * Paginated list of jobs scoped to a single project. Returns the
   * standard `ProjectSyncJobPage` shape: items + totalCount +
   * hasNextPage. Used by the GraphQL list query, the REST list route, and
   * the web job-history viewer.
   */
  list(
    params: {
      projectId: string;
      scope: Scope;
      page?: number | null;
      limit?: number | null;
      search?: string | null;
      sort?: ProjectSyncJobSortInput | null;
      status?: ProjectSyncJobStatus | null;
    },
    transaction?: unknown
  ): Promise<ProjectSyncJobPage>;

  /**
   * Read the persisted CDM payload that triggered this job. Used by the
   * REST download endpoint to stream the original JSON file. Throws
   * `NotFoundError` when the job does not exist or when its `projectId`
   * does not match the supplied one.
   */
  getPayload(
    params: { projectId: string; jobId: string },
    transaction?: unknown
  ): Promise<{
    payload: SyncProjectInput;
    importId: string | null;
    cdmVersion: number;
  }>;

  /**
   * Worker-only: load the job together with the request payload and the
   * scope captured at enqueue time. Never expose this through GraphQL/REST
   * — payload may contain large CDM bodies and scope is reconstructed from
   * persisted columns rather than the public response shape.
   */
  loadForExecution(
    params: { jobId: string },
    transaction?: unknown
  ): Promise<ProjectSyncJobExecutionData>;

  /** Idempotency: returns an active job for (projectId, importId) when importId is set. */
  findActiveByImportId(
    params: { projectId: string; importId: string },
    transaction?: unknown
  ): Promise<ProjectSyncJob | null>;

  transitionToRunning(params: { jobId: string }, transaction?: unknown): Promise<ProjectSyncJob>;

  markCompleted(
    params: { jobId: string; result: SyncProjectResult; warnings: string[] },
    transaction?: unknown
  ): Promise<ProjectSyncJob>;

  markFailed(
    params: { jobId: string; errorMessage: string; errorDetails?: Record<string, unknown> | null },
    transaction?: unknown
  ): Promise<ProjectSyncJob>;

  cancel(
    params: { projectId: string; jobId: string },
    transaction?: unknown
  ): Promise<ProjectSyncJob>;

  /**
   * Persist a rollback snapshot for a job. Captured by the worker inside the
   * import transaction (just before applying the new CDM), so the snapshot
   * commits if and only if the import commits.
   *
   * `sizeBytes` is computed by the service from `JSON.stringify(snapshot)`;
   * callers do not pre-serialise.
   */
  saveSnapshot(
    params: { jobId: string; snapshot: SyncProjectInput; takenAt: Date },
    transaction?: unknown
  ): Promise<void>;

  /**
   * Read a previously-captured rollback snapshot for the given job. Returns
   * `null` when no snapshot was persisted (e.g. the import failed before the
   * worker reached the snapshot step, or this is a legacy row predating the
   * snapshot column).
   */
  getSnapshot(
    params: { projectId: string; jobId: string },
    transaction?: unknown
  ): Promise<{
    snapshot: SyncProjectInput;
    takenAt: Date;
    sizeBytes: number;
  } | null>;
}
