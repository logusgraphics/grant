import { relations, sql } from 'drizzle-orm';
import {
  check,
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

/** `project_sync_jobs.operation` — import (CDM apply) or export (async CDM snapshot). */
export const projectSyncJobOperations = ['import', 'export'] as const;
export type ProjectSyncJobOperation = (typeof projectSyncJobOperations)[number];

/** `project_sync_jobs.mode_strategy` — CDM merge/replace; null for non-import jobs. */
export const projectSyncJobModeStrategies = ['merge', 'replace'] as const;
export type ProjectSyncJobModeStrategy = (typeof projectSyncJobModeStrategies)[number];

/**
 * Asynchronous CDM project jobs (import apply, future async export).
 * PostgreSQL: `project_sync_jobs` (renamed from `project_permission_sync_jobs` in migration 0067).
 */
export const projectSyncJobs = pgTable(
  'project_sync_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    scopeTenant: varchar('scope_tenant', { length: 50 }).notNull(),
    scopeId: varchar('scope_id', { length: 255 }).notNull(),
    cdmVersion: integer('cdm_version').notNull(),
    /** Optional client idempotency key (maps from `SyncProjectInput.id` on import). */
    jobName: text('job_name'),
    operation: varchar('operation', { length: 20 })
      .$type<ProjectSyncJobOperation>()
      .notNull()
      .default('import'),
    /** CDM mode strategy for import jobs; null for export and other operations. */
    modeStrategy: varchar('mode_strategy', {
      length: 20,
    }).$type<ProjectSyncJobModeStrategy | null>(),
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
    snapshot: jsonb('snapshot'),
    snapshotTakenAt: timestamp('snapshot_taken_at'),
    snapshotSizeBytes: integer('snapshot_size_bytes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    check('project_sync_jobs_operation_check', sql`("operation" IN ('import', 'export'))`),
    check(
      'project_sync_jobs_mode_strategy_check',
      sql`("mode_strategy" IS NULL OR "mode_strategy" IN ('merge', 'replace'))`
    ),
    index('project_sync_jobs_project_id_idx').on(table.projectId),
    index('project_sync_jobs_status_idx').on(table.status),
    index('project_sync_jobs_project_status_idx').on(table.projectId, table.status),
    uniqueIndex('project_sync_jobs_project_operation_job_name_unique')
      .on(table.projectId, table.operation, table.jobName)
      .where(
        sql`${table.jobName} IS NOT NULL AND ${table.deletedAt} IS NULL AND ${table.status} IN ('pending', 'running')`
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

export const projectSyncJobsRelations = relations(projectSyncJobs, ({ one }) => ({
  project: one(projects, {
    fields: [projectSyncJobs.projectId],
    references: [projects.id],
  }),
  enqueuedBy: one(users, {
    fields: [projectSyncJobs.enqueuedById],
    references: [users.id],
  }),
}));

export const projectSyncJobAuditLogs = pgTable(
  'project_sync_job_audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectSyncJobId: uuid('project_sync_job_id').references(() => projectSyncJobs.id, {
      onDelete: 'set null',
    }),
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
    index('project_sync_job_audit_logs_job_id_idx').on(t.projectSyncJobId),
    index('project_sync_job_audit_logs_action_idx').on(t.action),
    index('project_sync_job_audit_logs_scope_tenant_idx').on(t.scopeTenant),
  ]
);

export const projectSyncJobAuditLogsRelations = relations(projectSyncJobAuditLogs, ({ one }) => ({
  job: one(projectSyncJobs, {
    fields: [projectSyncJobAuditLogs.projectSyncJobId],
    references: [projectSyncJobs.id],
  }),
}));

export type ProjectSyncJobModel = typeof projectSyncJobs.$inferSelect;
export type NewProjectSyncJobModel = typeof projectSyncJobs.$inferInsert;
export type ProjectSyncJobAuditLogModel = typeof projectSyncJobAuditLogs.$inferSelect;
export type NewProjectSyncJobAuditLogModel = typeof projectSyncJobAuditLogs.$inferInsert;
