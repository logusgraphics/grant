import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';

export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('organizations_deleted_at_idx').on(t.deletedAt)]
);

export const organizationAuditLogs = pgTable(
  'organization_audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id)
      .notNull(),
    action: varchar('action', { length: 50 }).notNull(),
    oldValues: varchar('old_values', { length: 1000 }),
    newValues: varchar('new_values', { length: 1000 }),
    metadata: varchar('metadata', { length: 1000 }),
    performedBy: uuid('performed_by').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('organization_audit_logs_organization_id_idx').on(t.organizationId),
    index('organization_audit_logs_action_idx').on(t.action),
  ]
);

export type OrganizationModel = typeof organizations.$inferSelect;
export type NewOrganizationModel = typeof organizations.$inferInsert;
export type OrganizationAuditLogModel = typeof organizationAuditLogs.$inferSelect;
export type NewOrganizationAuditLogModel = typeof organizationAuditLogs.$inferInsert;

export const OrganizationAuditAction = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  SOFT_DELETE: 'SOFT_DELETE',
} as const;

export type OrganizationAuditActionType =
  (typeof OrganizationAuditAction)[keyof typeof OrganizationAuditAction];
