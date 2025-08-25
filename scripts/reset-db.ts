#!/usr/bin/env tsx

import { reset } from 'drizzle-seed';

import { db } from '@/graphql/lib/providers/database/connection';
import * as roleSchema from '@/graphql/repositories/roles/schema';
import * as userRoleSchema from '@/graphql/repositories/user-roles/schema';
import * as userSchema from '@/graphql/repositories/users/schema';

async function main() {
  console.log('🗑️ Starting database reset...');

  try {
    // Reset all tables (this will clear all data)
    console.log('🧹 Resetting database tables...');
    await reset(db, {
      users: userSchema.users,
      roles: roleSchema.roles,
      userRoles: userRoleSchema.userRoles,
      userAuditLogs: userSchema.userAuditLogs,
      roleAuditLogs: roleSchema.roleAuditLogs,
      userRolesAuditLogs: userRoleSchema.userRolesAuditLogs,
    });

    console.log('✅ Database reset completed successfully!');
    console.log('📝 All tables have been cleared and are ready for new data.');
  } catch (error) {
    console.error('❌ Error during database reset:', error);
    process.exit(1);
  }
}

main();
