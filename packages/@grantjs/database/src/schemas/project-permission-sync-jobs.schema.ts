import { relations, sql } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { projects } from './projects.schema';
import { users } from './users.schema';

/**
 * project_permission_sync_jobs
 *
 * Tracks asynchronous CDM (canonical data model) permission sync requests for a project.
 * The full request payload is stored in `payload` JSONB so the worker can replay it without
 * holding the request thread; lifecycle is captured by `status` + the timestamp columns.
 */
export const projectPermissionSyncJobs = pgTable(
  'project_permission_sync_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    scopeTenant: varchar('scope_tenant', { length: 50 }).notNull(),
    scopeId: varchar('scope_id', { length: 255 }).notNull(),
    cdmVersion: integer('cdm_version').notNull(),
    importId: text('import_id'),
    /** pending | running | completed | failed | cancelled */
    status: varchar('status', { length: 50 }).notNull().default('pending'),
    payload: jsonb('payload').notNull(),
    result: jsonb('result'),
    warnings: jsonb('warnings').default([]).notNull(),
    errorMessage: text('error_message'),
    errorDetails: jsonb('error_details'),
    cancelRequested: timestamp('cancel_requested_at'),
    enqueuedById: uuid('enqueued_by_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    cancelledAt: timestamp('cancelled_at'),
    /**
     * Pre-sync rollback snapshot of the project's CDM state, captured by the
     * worker inside the import transaction (just before applying the new
     * payload). Persists if and only if the import commits, so a `failed`
     * job will have `snapshot IS NULL`.
     */
    snapshot: jsonb('snapshot'),
    snapshotTakenAt: timestamp('snapshot_taken_at'),
    /** `Buffer.byteLength(JSON.stringify(snapshot), 'utf8')`, denormalised for cheap list-page rendering. */
    snapshotSizeBytes: integer('snapshot_size_bytes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    index('project_permission_sync_jobs_project_id_idx').on(table.projectId),
    index('project_permission_sync_jobs_status_idx').on(table.status),
    index('project_permission_sync_jobs_project_status_idx').on(table.projectId, table.status),
    /**
     * Idempotency: at most one active job per (project, importId).
     * Active means pending, running, or completed — only failed/cancelled jobs may be retried.
     */
    uniqueIndex('project_permission_sync_jobs_project_import_id_unique')
      .on(table.projectId, table.importId)
      .where(
        sql`${table.importId} IS NOT NULL AND ${table.deletedAt} IS NULL AND ${table.status} IN ('pending', 'running', 'completed')`
      ),
    pgPolicy('tenant_isolation_policy', {
      as: 'restrictive',
      for: 'select',
      using: sql`NULLIF(current_setting('app.current_project_id', true), '') IS NULL OR project_id = NULLIF(current_setting('app.current_project_id', true), '')::uuid`,
    }),
    pgPolicy('tenant_rls_allow', {
      as: 'permissive',
      for: 'all',
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
);

export const projectPermissionSyncJobsRelations = relations(
  projectPermissionSyncJobs,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectPermissionSyncJobs.projectId],
      references: [projects.id],
    }),
    enqueuedBy: one(users, {
      fields: [projectPermissionSyncJobs.enqueuedById],
      references: [users.id],
    }),
  })
);

export const projectPermissionSyncJobAuditLogs = pgTable(
  'project_permission_sync_job_audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectPermissionSyncJobId: uuid('project_permission_sync_job_id').references(
      () => projectPermissionSyncJobs.id,
      { onDelete: 'set null' }
    ),
    action: varchar('action', { length: 50 }).notNull(),
    oldValues: varchar('old_values', { length: 1000 }),
    newValues: varchar('new_values', { length: 1000 }),
    metadata: varchar('metadata', { length: 1000 }),
    performedBy: uuid('performed_by').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    scopeTenant: varchar('scope_tenant', { length: 50 }),
    scopeId: varchar('scope_id', { length: 255 }),
  },
  (t) => [
    index('project_permission_sync_job_audit_logs_job_id_idx').on(t.projectPermissionSyncJobId),
    index('project_permission_sync_job_audit_logs_action_idx').on(t.action),
    index('project_permission_sync_job_audit_logs_scope_tenant_idx').on(t.scopeTenant),
  ]
);

export const projectPermissionSyncJobAuditLogsRelations = relations(
  projectPermissionSyncJobAuditLogs,
  ({ one }) => ({
    job: one(projectPermissionSyncJobs, {
      fields: [projectPermissionSyncJobAuditLogs.projectPermissionSyncJobId],
      references: [projectPermissionSyncJobs.id],
    }),
  })
);

export type ProjectPermissionSyncJobModel = typeof projectPermissionSyncJobs.$inferSelect;
export type NewProjectPermissionSyncJobModel = typeof projectPermissionSyncJobs.$inferInsert;
export type ProjectPermissionSyncJobAuditLogModel =
  typeof projectPermissionSyncJobAuditLogs.$inferSelect;
export type NewProjectPermissionSyncJobAuditLogModel =
  typeof projectPermissionSyncJobAuditLogs.$inferInsert;
