import type {
  IProjectSyncJobRepository,
  ListProjectSyncJobsParams,
  ProjectSyncJobFull,
  ProjectSyncJobPayloadRow,
  ProjectSyncJobSnapshotRow,
} from '@grantjs/core';
import {
  type DbSchema,
  type NewProjectPermissionSyncJobModel,
  type ProjectPermissionSyncJobModel,
  projectPermissionSyncJobs,
} from '@grantjs/database';
import {
  ProjectSyncJob,
  ProjectSyncJobSortableField,
  ProjectSyncJobStatus,
  SortOrder,
  SyncProjectInput,
  SyncProjectResult,
} from '@grantjs/schema';
import { and, asc, count as drizzleCount, desc, eq, ilike, inArray, isNull } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';

import { NotFoundError } from '@/lib/errors';
import { Transaction } from '@/lib/transaction-manager.lib';

const STATUS_DB_TO_GQL: Record<string, ProjectSyncJobStatus> = {
  pending: ProjectSyncJobStatus.Pending,
  running: ProjectSyncJobStatus.Running,
  completed: ProjectSyncJobStatus.Completed,
  failed: ProjectSyncJobStatus.Failed,
  cancelled: ProjectSyncJobStatus.Cancelled,
};

const STATUS_GQL_TO_DB: Record<ProjectSyncJobStatus, string> = {
  [ProjectSyncJobStatus.Pending]: 'pending',
  [ProjectSyncJobStatus.Running]: 'running',
  [ProjectSyncJobStatus.Completed]: 'completed',
  [ProjectSyncJobStatus.Failed]: 'failed',
  [ProjectSyncJobStatus.Cancelled]: 'cancelled',
};

const ACTIVE_DB_STATUSES = ['pending', 'running', 'completed'];

function normalizeSyncJobResult(raw: unknown): SyncProjectResult | null {
  if (raw == null || typeof raw !== 'object') {
    return null;
  }
  const r = raw as Record<string, unknown>;
  return {
    projectId: String(r.projectId ?? ''),
    importId: (r.importId as string | null | undefined) ?? null,
    rolesCreated: Number(r.rolesCreated ?? 0),
    groupsCreated: Number(r.groupsCreated ?? 0),
    roleGroupsLinked: Number(r.roleGroupsLinked ?? 0),
    groupPermissionsLinked: Number(r.groupPermissionsLinked ?? 0),
    projectRolesLinked: Number(r.projectRolesLinked ?? 0),
    projectGroupsLinked: Number(r.projectGroupsLinked ?? 0),
    projectPermissionsLinked: Number(r.projectPermissionsLinked ?? 0),
    projectResourcesLinked: Number(r.projectResourcesLinked ?? 0),
    projectUsersEnsured: Number(r.projectUsersEnsured ?? 0),
    usersCreated: Number(r.usersCreated ?? 0),
    userRolesAssigned: Number(r.userRolesAssigned ?? 0),
    projectUserApiKeysCreated: Number(r.projectUserApiKeysCreated ?? 0),
    tagsCreated: Number(r.tagsCreated ?? 0),
    projectTagsLinked: Number(r.projectTagsLinked ?? 0),
    roleTagsLinked: Number(r.roleTagsLinked ?? 0),
    groupTagsLinked: Number(r.groupTagsLinked ?? 0),
    userTagsLinked: Number(r.userTagsLinked ?? 0),
    resourcesCreated: Number(r.resourcesCreated ?? 0),
    permissionsCreated: Number(r.permissionsCreated ?? 0),
    warnings: Array.isArray(r.warnings) ? (r.warnings as string[]) : [],
  };
}

function toEntity(row: ProjectPermissionSyncJobModel): ProjectSyncJob {
  const status = STATUS_DB_TO_GQL[row.status] ?? ProjectSyncJobStatus.Pending;
  return {
    id: row.id,
    projectId: row.projectId,
    status,
    cdmVersion: row.cdmVersion,
    importId: row.importId ?? null,
    result: normalizeSyncJobResult(row.result),
    warnings: Array.isArray(row.warnings) ? (row.warnings as string[]) : [],
    errorMessage: row.errorMessage ?? null,
    enqueuedAt: row.createdAt,
    startedAt: row.startedAt ?? null,
    completedAt: row.completedAt ?? null,
    cancelledAt: row.cancelledAt ?? null,
    /**
     * `hasSnapshot` is derived rather than stored: a non-null `snapshot`
     * column always means the worker captured one. Keeping derivation here
     * lets the GraphQL layer expose the boolean without round-tripping the
     * full JSONB payload on list queries.
     */
    hasSnapshot: row.snapshot != null,
    snapshotTakenAt: row.snapshotTakenAt ?? null,
    snapshotSizeBytes: row.snapshotSizeBytes ?? null,
  };
}

/**
 * Storage adapter for the asynchronous project permissions sync job tracking row.
 * Uses Drizzle directly (rather than the EntityRepository base) since this entity
 * doesn't need GraphQL pagination/relations.
 */
export class ProjectSyncJobRepository implements IProjectSyncJobRepository {
  constructor(private readonly db: DbSchema) {}

  public async insert(
    params: {
      projectId: string;
      scopeTenant: string;
      scopeId: string;
      cdmVersion: number;
      importId: string | null;
      payload: SyncProjectInput;
      enqueuedById: string;
    },
    transaction?: Transaction
  ): Promise<ProjectSyncJob> {
    const dbInstance = transaction ?? this.db;
    const values: NewProjectPermissionSyncJobModel = {
      projectId: params.projectId,
      scopeTenant: params.scopeTenant,
      scopeId: params.scopeId,
      cdmVersion: params.cdmVersion,
      importId: params.importId,
      status: 'pending',
      payload: params.payload as unknown as NewProjectPermissionSyncJobModel['payload'],
      warnings: [] as unknown as NewProjectPermissionSyncJobModel['warnings'],
      enqueuedById: params.enqueuedById,
    };
    const [row] = await dbInstance.insert(projectPermissionSyncJobs).values(values).returning();
    if (!row) {
      throw new Error('Failed to insert project permission sync job');
    }
    return toEntity(row);
  }

  public async getById(jobId: string, transaction?: Transaction): Promise<ProjectSyncJob | null> {
    const dbInstance = transaction ?? this.db;
    const rows = await dbInstance
      .select()
      .from(projectPermissionSyncJobs)
      .where(
        and(eq(projectPermissionSyncJobs.id, jobId), isNull(projectPermissionSyncJobs.deletedAt))
      )
      .limit(1);
    return rows[0] ? toEntity(rows[0]) : null;
  }

  public async getFullById(
    jobId: string,
    transaction?: Transaction
  ): Promise<ProjectSyncJobFull | null> {
    const dbInstance = transaction ?? this.db;
    const rows = await dbInstance
      .select()
      .from(projectPermissionSyncJobs)
      .where(
        and(eq(projectPermissionSyncJobs.id, jobId), isNull(projectPermissionSyncJobs.deletedAt))
      )
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return {
      job: toEntity(row),
      payload: row.payload as unknown as SyncProjectInput,
      scopeTenant: row.scopeTenant,
      scopeId: row.scopeId,
      cancelRequested: row.cancelRequested != null,
    };
  }

  public async findActiveByImportId(
    params: { projectId: string; importId: string },
    transaction?: Transaction
  ): Promise<ProjectSyncJob | null> {
    const dbInstance = transaction ?? this.db;
    const rows = await dbInstance
      .select()
      .from(projectPermissionSyncJobs)
      .where(
        and(
          eq(projectPermissionSyncJobs.projectId, params.projectId),
          eq(projectPermissionSyncJobs.importId, params.importId),
          isNull(projectPermissionSyncJobs.deletedAt),
          inArray(projectPermissionSyncJobs.status, ACTIVE_DB_STATUSES)
        )
      )
      .orderBy(desc(projectPermissionSyncJobs.createdAt))
      .limit(1);
    return rows[0] ? toEntity(rows[0]) : null;
  }

  public async getPayloadById(
    jobId: string,
    transaction?: Transaction
  ): Promise<ProjectSyncJobPayloadRow | null> {
    const dbInstance = transaction ?? this.db;
    const rows = await dbInstance
      .select({
        payload: projectPermissionSyncJobs.payload,
        importId: projectPermissionSyncJobs.importId,
        cdmVersion: projectPermissionSyncJobs.cdmVersion,
        projectId: projectPermissionSyncJobs.projectId,
      })
      .from(projectPermissionSyncJobs)
      .where(
        and(eq(projectPermissionSyncJobs.id, jobId), isNull(projectPermissionSyncJobs.deletedAt))
      )
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return {
      payload: row.payload as unknown as SyncProjectInput,
      importId: row.importId ?? null,
      cdmVersion: row.cdmVersion,
      projectId: row.projectId,
    };
  }

  public async listByProject(
    params: ListProjectSyncJobsParams,
    transaction?: Transaction
  ): Promise<{ items: ProjectSyncJob[]; totalCount: number }> {
    const dbInstance = transaction ?? this.db;

    const page = Math.max(1, params.page ?? 1);
    const requestedLimit = params.limit ?? 50;
    const limit = requestedLimit < 0 ? 0 : Math.min(requestedLimit, 200);
    const offset = limit > 0 ? (page - 1) * limit : 0;

    const filters = [
      eq(projectPermissionSyncJobs.projectId, params.projectId),
      eq(projectPermissionSyncJobs.scopeTenant, params.scopeTenant),
      eq(projectPermissionSyncJobs.scopeId, params.scopeId),
      isNull(projectPermissionSyncJobs.deletedAt),
    ];

    if (params.status) {
      const dbStatus = STATUS_GQL_TO_DB[params.status];
      if (dbStatus) {
        filters.push(eq(projectPermissionSyncJobs.status, dbStatus));
      }
    }

    if (params.search && params.search.trim().length > 0) {
      const term = `%${params.search.trim()}%`;
      filters.push(ilike(projectPermissionSyncJobs.importId, term));
    }

    const whereClause = and(...filters);

    const sortField = params.sort?.field ?? ProjectSyncJobSortableField.EnqueuedAt;
    const sortOrder = params.sort?.order ?? SortOrder.Desc;
    const sortColumnMap: Record<ProjectSyncJobSortableField, PgColumn> = {
      [ProjectSyncJobSortableField.EnqueuedAt]: projectPermissionSyncJobs.createdAt,
      [ProjectSyncJobSortableField.StartedAt]: projectPermissionSyncJobs.startedAt,
      [ProjectSyncJobSortableField.CompletedAt]: projectPermissionSyncJobs.completedAt,
      [ProjectSyncJobSortableField.Status]: projectPermissionSyncJobs.status,
      [ProjectSyncJobSortableField.ImportId]: projectPermissionSyncJobs.importId,
    };
    const sortColumn = sortColumnMap[sortField] ?? projectPermissionSyncJobs.createdAt;
    const orderBy = sortOrder === SortOrder.Asc ? asc(sortColumn) : desc(sortColumn);

    const countQuery = dbInstance
      .select({ value: drizzleCount() })
      .from(projectPermissionSyncJobs)
      .where(whereClause);

    if (limit === 0) {
      const [countRow] = await countQuery;
      return { items: [], totalCount: countRow?.value ?? 0 };
    }

    const baseSelect = dbInstance
      .select()
      .from(projectPermissionSyncJobs)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const [rows, countResult] = await Promise.all([baseSelect, countQuery]);

    return {
      items: rows.map(toEntity),
      totalCount: countResult[0]?.value ?? 0,
    };
  }

  public async updateStatus(
    params: {
      jobId: string;
      status: ProjectSyncJobStatus;
      startedAt?: Date | null;
      completedAt?: Date | null;
      cancelledAt?: Date | null;
      cancelRequested?: Date | null;
      result?: SyncProjectResult | null;
      warnings?: string[] | null;
      errorMessage?: string | null;
      errorDetails?: Record<string, unknown> | null;
    },
    transaction?: Transaction
  ): Promise<ProjectSyncJob> {
    const dbInstance = transaction ?? this.db;
    const update: Partial<NewProjectPermissionSyncJobModel> = {
      status: STATUS_GQL_TO_DB[params.status],
      updatedAt: new Date(),
    };
    if (params.startedAt !== undefined) update.startedAt = params.startedAt;
    if (params.completedAt !== undefined) update.completedAt = params.completedAt;
    if (params.cancelledAt !== undefined) update.cancelledAt = params.cancelledAt;
    if (params.cancelRequested !== undefined) update.cancelRequested = params.cancelRequested;
    if (params.result !== undefined) {
      update.result = params.result as unknown as NewProjectPermissionSyncJobModel['result'];
    }
    if (params.warnings !== undefined && params.warnings !== null) {
      update.warnings = params.warnings as unknown as NewProjectPermissionSyncJobModel['warnings'];
    }
    if (params.errorMessage !== undefined) update.errorMessage = params.errorMessage;
    if (params.errorDetails !== undefined) {
      update.errorDetails =
        params.errorDetails as unknown as NewProjectPermissionSyncJobModel['errorDetails'];
    }

    const [row] = await dbInstance
      .update(projectPermissionSyncJobs)
      .set(update)
      .where(
        and(
          eq(projectPermissionSyncJobs.id, params.jobId),
          isNull(projectPermissionSyncJobs.deletedAt)
        )
      )
      .returning();

    if (!row) {
      throw new NotFoundError('ProjectSyncJob', params.jobId);
    }
    return toEntity(row);
  }

  public async updateSnapshot(
    params: {
      jobId: string;
      snapshot: SyncProjectInput;
      takenAt: Date;
      sizeBytes: number;
    },
    transaction?: Transaction
  ): Promise<void> {
    const dbInstance = transaction ?? this.db;
    const update: Partial<NewProjectPermissionSyncJobModel> = {
      snapshot: params.snapshot as unknown as NewProjectPermissionSyncJobModel['snapshot'],
      snapshotTakenAt: params.takenAt,
      snapshotSizeBytes: params.sizeBytes,
      updatedAt: new Date(),
    };
    const [row] = await dbInstance
      .update(projectPermissionSyncJobs)
      .set(update)
      .where(
        and(
          eq(projectPermissionSyncJobs.id, params.jobId),
          isNull(projectPermissionSyncJobs.deletedAt)
        )
      )
      .returning({ id: projectPermissionSyncJobs.id });

    if (!row) {
      throw new NotFoundError('ProjectSyncJob', params.jobId);
    }
  }

  public async getSnapshotById(
    jobId: string,
    transaction?: Transaction
  ): Promise<ProjectSyncJobSnapshotRow | null> {
    const dbInstance = transaction ?? this.db;
    const rows = await dbInstance
      .select({
        snapshot: projectPermissionSyncJobs.snapshot,
        snapshotTakenAt: projectPermissionSyncJobs.snapshotTakenAt,
        snapshotSizeBytes: projectPermissionSyncJobs.snapshotSizeBytes,
        projectId: projectPermissionSyncJobs.projectId,
      })
      .from(projectPermissionSyncJobs)
      .where(
        and(eq(projectPermissionSyncJobs.id, jobId), isNull(projectPermissionSyncJobs.deletedAt))
      )
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    if (row.snapshot == null) return null;
    return {
      snapshot: row.snapshot as unknown as SyncProjectInput,
      takenAt: row.snapshotTakenAt ?? new Date(0),
      sizeBytes: row.snapshotSizeBytes ?? 0,
      projectId: row.projectId,
    };
  }
}
