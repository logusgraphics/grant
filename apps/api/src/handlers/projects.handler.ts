import type {
  IAccountProjectService,
  IAccountProjectTagService,
  IJobAdapter,
  IOrganizationProjectService,
  IOrganizationProjectTagService,
  IProjectGroupService,
  IProjectPermissionExportService,
  IProjectPermissionService,
  IProjectPermissionsSyncJobService,
  IProjectPermissionSyncService,
  IProjectRoleService,
  IProjectService,
  IProjectTagService,
  IProjectUserService,
  ITransactionalConnection,
} from '@grantjs/core';
import {
  MutationCancelProjectPermissionsSyncArgs,
  MutationCreateProjectArgs,
  MutationDeleteProjectArgs,
  MutationStartProjectPermissionsSyncArgs,
  MutationUpdateProjectArgs,
  Project,
  ProjectPage,
  ProjectPermissionsSyncJob,
  ProjectPermissionsSyncJobPage,
  QueryProjectPermissionsSyncJobArgs,
  QueryProjectPermissionsSyncJobsArgs,
  QueryProjectsArgs,
  SyncProjectPermissionsInput,
  Tenant,
} from '@grantjs/schema';

import { IEntityCacheAdapter } from '@/lib/cache';
import { BadRequestError, ConfigurationError, NotFoundError, ValidationError } from '@/lib/errors';
import { Transaction } from '@/lib/transaction-manager.lib';
import { DeleteParams, SelectedFields } from '@/types';

import { CacheHandler, type ScopeServices } from './base/cache-handler';

/** Job id for the async project permissions sync worker (registered in apps/api/src/jobs). */
const PROJECT_PERMISSIONS_SYNC_JOB_ID = 'project-permissions-sync';

export class ProjectHandler extends CacheHandler {
  constructor(
    private readonly organizationProjectTags: IOrganizationProjectTagService,
    private readonly accountProjectTags: IAccountProjectTagService,
    private readonly projects: IProjectService,
    private readonly accountProjects: IAccountProjectService,
    private readonly organizationProjects: IOrganizationProjectService,
    private readonly projectTags: IProjectTagService,
    private readonly projectPermissions: IProjectPermissionService,
    private readonly projectGroups: IProjectGroupService,
    private readonly projectRoles: IProjectRoleService,
    private readonly projectUsers: IProjectUserService,
    private readonly projectPermissionSync: IProjectPermissionSyncService,
    private readonly projectPermissionExport: IProjectPermissionExportService,
    private readonly projectPermissionsSyncJobs: IProjectPermissionsSyncJobService,
    private readonly jobs: IJobAdapter | null,
    cache: IEntityCacheAdapter,
    scopeServices: ScopeServices,
    private readonly db: ITransactionalConnection<Transaction>
  ) {
    super(cache, scopeServices);
  }

  public async getProjects(
    params: QueryProjectsArgs & SelectedFields<Project>
  ): Promise<ProjectPage> {
    const { scope, page, limit, sort, search, ids, tagIds, requestedFields } = params;

    let projectIds = await this.getScopedProjectIds(scope);

    if (tagIds && tagIds.length > 0) {
      switch (scope.tenant) {
        case Tenant.Organization:
          {
            const organizationId = scope.id;
            const organizationProjectTags =
              await this.organizationProjectTags.getOrganizationProjectTagIntersection(
                organizationId,
                projectIds,
                tagIds
              );
            projectIds = organizationProjectTags
              .filter(
                ({ projectId, tagId }) => projectIds.includes(projectId) && tagIds.includes(tagId)
              )
              .map(({ projectId }) => projectId);
          }
          break;
        case Tenant.Account:
          {
            const accountId = scope.id;
            const accountProjectTags =
              await this.accountProjectTags.getAccountProjectTagIntersection(
                accountId,
                projectIds,
                tagIds
              );
            projectIds = accountProjectTags
              .filter(
                ({ projectId, tagId }) => projectIds.includes(projectId) && tagIds.includes(tagId)
              )
              .map(({ projectId }) => projectId);
          }
          break;
        default:
          throw new BadRequestError('Invalid scope');
      }
    }

    if (ids && ids.length > 0) {
      projectIds = ids.filter((projectId) => projectIds.includes(projectId));
    }

    if (projectIds.length === 0) {
      return {
        projects: [],
        totalCount: 0,
        hasNextPage: false,
      };
    }

    const projectsResult = await this.projects.getProjects({
      ids: projectIds,
      page,
      limit,
      sort,
      search,
      requestedFields,
    });

    return projectsResult;
  }

  /**
   * Enqueue an asynchronous CDM permission sync job. Performs the same fast
   * pre-flight validation as the legacy synchronous endpoint (so callers see
   * malformed input immediately instead of after the worker picks up the job),
   * checks for an in-flight job with the same `importId` (idempotency), then
   * persists the job tracking row and dispatches a one-off job.
   */
  public async startProjectPermissionsSync(
    params: MutationStartProjectPermissionsSyncArgs & { enqueuedById: string }
  ): Promise<ProjectPermissionsSyncJob> {
    const jobs = this.jobs;
    if (!jobs || !jobs.enqueue) {
      throw new ConfigurationError(
        'Project permissions sync is unavailable: job adapter is not configured. Set JOBS_ENABLED=true.'
      );
    }
    const enqueueJob = jobs.enqueue.bind(jobs);

    this.assertProjectScope(params.scope);
    const scopeProjectId = this.projectIdFromScope(params.scope);
    if (scopeProjectId !== params.id) {
      throw new ValidationError(
        'scope id must contain the same projectId as the projectId argument'
      );
    }
    this.validateSyncInput(params.input);

    const importId = params.input.importId ?? null;
    if (importId !== null) {
      const inflight = await this.projectPermissionsSyncJobs.findActiveByImportId({
        projectId: params.id,
        importId,
      });
      if (inflight) {
        return inflight;
      }
    }

    const job = await this.projectPermissionsSyncJobs.create({
      projectId: params.id,
      scope: params.scope,
      cdmVersion: params.input.cdmVersion,
      importId,
      payload: params.input,
      enqueuedById: params.enqueuedById,
    });

    await enqueueJob(PROJECT_PERMISSIONS_SYNC_JOB_ID, {
      scope: params.scope,
      payload: { jobRecordId: job.id },
    });

    return job;
  }

  public async getProjectPermissionsSyncJob(
    params: QueryProjectPermissionsSyncJobArgs
  ): Promise<ProjectPermissionsSyncJob> {
    this.assertProjectScope(params.scope);
    return this.projectPermissionsSyncJobs.getById({
      projectId: params.id,
      jobId: params.jobId,
    });
  }

  public async listProjectPermissionsSyncJobs(
    params: QueryProjectPermissionsSyncJobsArgs
  ): Promise<ProjectPermissionsSyncJobPage> {
    this.assertProjectScope(params.scope);
    const scopeProjectId = this.projectIdFromScope(params.scope);
    if (scopeProjectId !== params.id) {
      throw new ValidationError(
        'scope id must contain the same projectId as the projectId argument'
      );
    }
    return this.projectPermissionsSyncJobs.list({
      projectId: params.id,
      scope: params.scope,
      page: params.page,
      limit: params.limit,
      search: params.search,
      sort: params.sort,
      status: params.status,
    });
  }

  /**
   * Returns the original CDM JSON body that was submitted when the job was
   * enqueued. Used by the REST download endpoint. The payload is read from
   * the persisted JSONB column on the job row; no file storage is involved.
   */
  public async getProjectPermissionsSyncJobPayload(
    params: QueryProjectPermissionsSyncJobArgs
  ): Promise<{
    payload: SyncProjectPermissionsInput;
    importId: string | null;
    cdmVersion: number;
  }> {
    this.assertProjectScope(params.scope);
    const scopeProjectId = this.projectIdFromScope(params.scope);
    if (scopeProjectId !== params.id) {
      throw new ValidationError(
        'scope id must contain the same projectId as the projectId argument'
      );
    }
    return this.projectPermissionsSyncJobs.getPayload({
      projectId: params.id,
      jobId: params.jobId,
    });
  }

  public async cancelProjectPermissionsSync(
    params: MutationCancelProjectPermissionsSyncArgs
  ): Promise<ProjectPermissionsSyncJob> {
    this.assertProjectScope(params.scope);
    return this.projectPermissionsSyncJobs.cancel({
      projectId: params.id,
      jobId: params.jobId,
    });
  }

  /**
   * Snapshot the project's current permission/role/group/user-assignment
   * state and return it as a replay-ready `SyncProjectPermissionsInput` body.
   * The REST layer streams the response with a `Content-Disposition`
   * attachment header so browsers prompt for a save.
   */
  public async exportProjectPermissions(params: {
    id: string;
    scope: { tenant: Tenant; id: string };
    cdmVersion?: number | null;
  }): Promise<SyncProjectPermissionsInput> {
    this.assertProjectScope(params.scope);
    const scopeProjectId = this.projectIdFromScope(params.scope);
    if (scopeProjectId !== params.id) {
      throw new ValidationError(
        'scope id must contain the same projectId as the projectId argument'
      );
    }
    const cdmVersion = params.cdmVersion ?? 1;
    return this.projectPermissionExport.exportProjectPermissions({
      projectId: params.id,
      scope: params.scope,
      cdmVersion,
    });
  }

  /**
   * Read the pre-sync rollback snapshot captured by the worker for a given
   * sync job. Throws `NotFoundError` when the job has no snapshot (e.g. it
   * failed before the worker reached the snapshot step, or it is a legacy
   * row enqueued before this column existed).
   */
  public async getProjectPermissionsSyncJobSnapshot(
    params: QueryProjectPermissionsSyncJobArgs
  ): Promise<{
    snapshot: SyncProjectPermissionsInput;
    takenAt: Date;
    sizeBytes: number;
  }> {
    this.assertProjectScope(params.scope);
    const scopeProjectId = this.projectIdFromScope(params.scope);
    if (scopeProjectId !== params.id) {
      throw new ValidationError(
        'scope id must contain the same projectId as the projectId argument'
      );
    }
    const result = await this.projectPermissionsSyncJobs.getSnapshot({
      projectId: params.id,
      jobId: params.jobId,
    });
    if (!result) {
      throw new NotFoundError('ProjectPermissionsSyncJobSnapshot', params.jobId);
    }
    return result;
  }

  private assertProjectScope(scope: { tenant: Tenant; id: string }): void {
    if (scope.tenant !== Tenant.AccountProject && scope.tenant !== Tenant.OrganizationProject) {
      throw new ValidationError(
        'project permissions sync requires accountProject or organizationProject scope'
      );
    }
  }

  private projectIdFromScope(scope: { id: string }): string {
    return scope.id.split(':')[1] ?? '';
  }

  private validateSyncInput(input: MutationStartProjectPermissionsSyncArgs['input']): void {
    if (input.cdmVersion !== 1) {
      throw new ValidationError('Unsupported cdmVersion; only 1 is allowed');
    }

    const userIdsSeen = new Set<string>();
    for (const ua of input.userAssignments) {
      if (userIdsSeen.has(ua.userId)) {
        throw new ValidationError(`Duplicate userId in userAssignments: ${ua.userId}`);
      }
      userIdsSeen.add(ua.userId);
    }

    const externalKeys = new Set<string>();
    for (const t of input.roleTemplates) {
      if (externalKeys.has(t.externalKey)) {
        throw new ValidationError(`Duplicate role template externalKey: ${t.externalKey}`);
      }
      externalKeys.add(t.externalKey);
      if (t.permissionRefs.length === 0) {
        throw new ValidationError(
          `roleTemplates[${t.externalKey}] must include at least one permissionRef`
        );
      }
    }
  }

  public async createProject(params: MutationCreateProjectArgs): Promise<Project> {
    return await this.db.withTransaction(async (tx: Transaction) => {
      const { input } = params;
      const { name, description, scope, tagIds, primaryTagId } = input;

      const project = await this.projects.createProject({ name, description }, tx);
      const { id: projectId } = project;

      switch (scope.tenant) {
        case Tenant.Account:
          await this.accountProjects.addAccountProject({ accountId: scope.id, projectId }, tx);
          break;
        case Tenant.Organization:
          await this.organizationProjects.addOrganizationProject(
            { organizationId: scope.id, projectId },
            tx
          );
          break;
        default:
          throw new BadRequestError('Invalid scope');
      }

      if (tagIds && tagIds.length > 0) {
        await Promise.all(
          tagIds.map((tagId) => {
            switch (scope.tenant) {
              case Tenant.Organization:
                return this.organizationProjectTags.addOrganizationProjectTag(
                  { organizationId: scope.id, projectId, tagId, isPrimary: tagId === primaryTagId },
                  tx
                );
              case Tenant.Account:
                return this.accountProjectTags.addAccountProjectTag(
                  { accountId: scope.id, projectId, tagId, isPrimary: tagId === primaryTagId },
                  tx
                );
              default:
                throw new BadRequestError('Invalid scope');
            }
          })
        );
      }

      this.addProjectIdToScopeCache(scope, projectId);

      return project;
    });
  }

  public async updateProject(params: MutationUpdateProjectArgs): Promise<Project> {
    return await this.db.withTransaction(async (tx: Transaction) => {
      const { id: projectId, input } = params;
      const { scope, tagIds, primaryTagId } = input;
      let currentTagIds: string[] = [];

      if (Array.isArray(tagIds)) {
        switch (scope.tenant) {
          case Tenant.Organization:
            {
              const organizationId = scope.id;
              const currentTags = await this.organizationProjectTags.getOrganizationProjectTags(
                { organizationId, projectId },
                tx
              );
              currentTagIds = currentTags.map((pt) => pt.tagId);
            }
            break;
          case Tenant.Account:
            {
              const accountId = scope.id;
              const currentTags = await this.accountProjectTags.getAccountProjectTags(
                { accountId, projectId },
                tx
              );
              currentTagIds = currentTags.map((pt) => pt.tagId);
            }
            break;
          default:
            throw new BadRequestError('Invalid scope');
        }
      }

      const updatedProject = await this.projects.updateProject(params, tx);

      if (Array.isArray(tagIds)) {
        const newTagIds = tagIds.filter((tagId) => !currentTagIds.includes(tagId));
        const removedTagIds = currentTagIds.filter((tagId) => !tagIds.includes(tagId));
        const updatedTagIds = tagIds.filter((tagId) => currentTagIds.includes(tagId));
        switch (scope.tenant) {
          case Tenant.Organization: {
            const organizationId = scope.id;
            await Promise.all(
              updatedTagIds.map((tagId) =>
                this.organizationProjectTags.updateOrganizationProjectTag(
                  { organizationId, projectId, tagId, isPrimary: tagId === primaryTagId },
                  tx
                )
              )
            );
            await Promise.all(
              newTagIds.map((tagId) =>
                this.organizationProjectTags.addOrganizationProjectTag(
                  { organizationId, projectId, tagId, isPrimary: tagId === primaryTagId },
                  tx
                )
              )
            );
            await Promise.all(
              removedTagIds.map((tagId) =>
                this.organizationProjectTags.removeOrganizationProjectTag(
                  { organizationId, projectId, tagId },
                  tx
                )
              )
            );
            break;
          }
          case Tenant.Account: {
            const accountId = scope.id;
            await Promise.all(
              updatedTagIds.map((tagId) =>
                this.accountProjectTags.updateAccountProjectTag(
                  { accountId, projectId, tagId, isPrimary: tagId === primaryTagId },
                  tx
                )
              )
            );
            await Promise.all(
              newTagIds.map((tagId) =>
                this.accountProjectTags.addAccountProjectTag(
                  { accountId, projectId, tagId, isPrimary: tagId === primaryTagId },
                  tx
                )
              )
            );
            await Promise.all(
              removedTagIds.map((tagId) =>
                this.accountProjectTags.removeAccountProjectTag({ accountId, projectId, tagId }, tx)
              )
            );
            break;
          }
          default:
            throw new BadRequestError('Invalid scope');
        }
      }
      return updatedProject;
    });
  }

  public async deleteProject(params: MutationDeleteProjectArgs & DeleteParams): Promise<Project> {
    return await this.db.withTransaction(async (tx: Transaction) => {
      const { id: projectId, scope } = params;

      // Query common project data (not tenant-specific)
      const [projectTags, projectPermissions, projectGroups, projectRoles, projectUsers] =
        await Promise.all([
          this.projectTags.getProjectTags({ projectId }, tx),
          this.projectPermissions.getProjectPermissions({ projectId }, tx),
          this.projectGroups.getProjectGroups({ projectId }, tx),
          this.projectRoles.getProjectRoles({ projectId }, tx),
          this.projectUsers.getProjectUsers({ projectId }, tx),
        ]);

      const tagIds = projectTags.map((pt) => pt.tagId);
      const permissionIds = projectPermissions.map((pp) => pp.permissionId);
      const groupIds = projectGroups.map((pg) => pg.groupId);
      const roleIds = projectRoles.map((pr) => pr.roleId);
      const userIds = projectUsers.map((pu) => pu.userId);

      switch (scope.tenant) {
        case Tenant.Account: {
          const accountId = scope.id;

          const accountProjectTags = await this.accountProjectTags.getAccountProjectTags(
            { accountId, projectId },
            tx
          );
          const accountTagIds = accountProjectTags.map((apt) => apt.tagId);

          await this.accountProjects.removeAccountProject({ accountId, projectId }, tx);

          await Promise.all(
            accountTagIds.map((tagId) =>
              this.accountProjectTags.removeAccountProjectTag({ accountId, projectId, tagId }, tx)
            )
          );
          break;
        }
        case Tenant.Organization: {
          const organizationId = scope.id;

          const organizationProjectTags =
            await this.organizationProjectTags.getOrganizationProjectTags(
              { organizationId, projectId },
              tx
            );
          const organizationTagIds = organizationProjectTags.map((opt) => opt.tagId);

          await this.organizationProjects.removeOrganizationProject(
            { organizationId, projectId },
            tx
          );

          await Promise.all(
            organizationTagIds.map((tagId) =>
              this.organizationProjectTags.removeOrganizationProjectTag(
                { organizationId, projectId, tagId },
                tx
              )
            )
          );
          break;
        }
        default:
          throw new BadRequestError('Invalid scope');
      }

      const userRolesForProjectRoles = await Promise.all(
        roleIds.map((roleId) => this.scopeServices.userRoles.getUserRoles({ roleId }, tx))
      );

      await Promise.all([
        ...tagIds.map((tagId) => this.projectTags.removeProjectTag({ projectId, tagId }, tx)),
        ...permissionIds.map((permissionId) =>
          this.projectPermissions.removeProjectPermission({ projectId, permissionId }, tx)
        ),
        ...groupIds.map((groupId) =>
          this.projectGroups.removeProjectGroup({ projectId, groupId }, tx)
        ),
        ...roleIds.map((roleId) => this.projectRoles.removeProjectRole({ projectId, roleId }, tx)),
        ...userIds.map((userId) => this.projectUsers.removeProjectUser({ projectId, userId }, tx)),
        ...userRolesForProjectRoles
          .flat()
          .map((ur) =>
            this.scopeServices.userRoles.removeUserRole(
              { userId: ur.userId, roleId: ur.roleId },
              tx
            )
          ),
      ]);

      this.removeProjectIdFromScopeCache(scope, projectId);

      return await this.projects.deleteProject(params, tx);
    });
  }
}
