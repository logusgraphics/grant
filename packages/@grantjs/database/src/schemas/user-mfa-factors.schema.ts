import { relations } from 'drizzle-orm';
import { pgTable, uuid, varchar, timestamp, boolean, index } from 'drizzle-orm/pg-core';

import { users } from './users.schema';

export const userMfaFactors = pgTable(
  'user_mfa_factors',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    type: varchar('type', { length: 50 }).default('totp').notNull(),
    encryptedSecret: varchar('encrypted_secret', { length: 4000 }).notNull(),
    secretIv: varchar('secret_iv', { length: 255 }).notNull(),
    secretTag: varchar('secret_tag', { length: 255 }).notNull(),
    isPrimary: boolean('is_primary').default(true).notNull(),
    isEnabled: boolean('is_enabled').default(false).notNull(),
    lastUsedAt: timestamp('last_used_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (t) => [
    index('user_mfa_factors_user_id_idx').on(t.userId),
    index('user_mfa_factors_type_idx').on(t.type),
    index('user_mfa_factors_deleted_at_idx').on(t.deletedAt),
  ]
);

export const userMfaFactorsRelations = relations(userMfaFactors, ({ one }) => ({
  user: one(users, {
    fields: [userMfaFactors.userId],
    references: [users.id],
  }),
}));

export const userMfaFactorAuditLogs = pgTable(
  'user_mfa_factor_audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userMfaFactorId: uuid('user_mfa_factor_id').references(() => userMfaFactors.id, {
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
    index('user_mfa_factor_audit_logs_user_mfa_factor_id_idx').on(t.userMfaFactorId),
    index('user_mfa_factor_audit_logs_action_idx').on(t.action),
    index('user_mfa_factor_audit_logs_scope_tenant_idx').on(t.scopeTenant),
  ]
);

export type UserMfaFactorModel = typeof userMfaFactors.$inferSelect;
export type NewUserMfaFactorModel = typeof userMfaFactors.$inferInsert;
export type UserMfaFactorAuditLogModel = typeof userMfaFactorAuditLogs.$inferSelect;
export type NewUserMfaFactorAuditLogModel = typeof userMfaFactorAuditLogs.$inferInsert;
