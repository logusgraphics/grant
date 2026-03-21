import { relations } from 'drizzle-orm';
import { pgTable, uuid, varchar, timestamp, boolean, index } from 'drizzle-orm/pg-core';

import { userMfaFactors } from './user-mfa-factors.schema';
import { users } from './users.schema';

export const userMfaRecoveryCodes = pgTable(
  'user_mfa_recovery_codes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    userMfaFactorId: uuid('user_mfa_factor_id').references(() => userMfaFactors.id, {
      onDelete: 'set null',
    }),
    codeHash: varchar('code_hash', { length: 255 }).notNull(),
    isUsed: boolean('is_used').default(false).notNull(),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (t) => [
    index('user_mfa_recovery_codes_user_id_idx').on(t.userId),
    index('user_mfa_recovery_codes_code_hash_idx').on(t.codeHash),
    index('user_mfa_recovery_codes_deleted_at_idx').on(t.deletedAt),
  ]
);

export const userMfaRecoveryCodesRelations = relations(userMfaRecoveryCodes, ({ one }) => ({
  user: one(users, {
    fields: [userMfaRecoveryCodes.userId],
    references: [users.id],
  }),
  factor: one(userMfaFactors, {
    fields: [userMfaRecoveryCodes.userMfaFactorId],
    references: [userMfaFactors.id],
  }),
}));

export type UserMfaRecoveryCodeModel = typeof userMfaRecoveryCodes.$inferSelect;
export type NewUserMfaRecoveryCodeModel = typeof userMfaRecoveryCodes.$inferInsert;
