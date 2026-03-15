#!/usr/bin/env tsx

import { getEnv, resolveDatabaseUrl } from '@grantjs/env';
import { reset } from 'drizzle-seed';

import { closeDatabase, initializeDBConnection } from '../connection';
import {
  projectPermissions,
  projectPermissionsAuditLogs,
  userTags,
  userTagsAuditLogs,
} from '../schemas';
import { accountProjects, accountProjectsAuditLogs } from '../schemas/account-projects.schema';
import { accountAuditLogs, accounts } from '../schemas/accounts.schema';
import { groupPermissions, groupPermissionsAuditLogs } from '../schemas/group-permissions.schema';
import { groupTags, groupTagsAuditLogs } from '../schemas/group-tags.schema';
import { groupAuditLogs, groups } from '../schemas/groups.schema';
import {
  organizationGroups,
  organizationGroupsAuditLogs,
} from '../schemas/organization-groups.schema';
import {
  organizationInvitations,
  organizationInvitationsAuditLogs,
} from '../schemas/organization-invitations.schema';
import {
  organizationPermissions,
  organizationPermissionsAuditLogs,
} from '../schemas/organization-permissions.schema';
import {
  organizationProjects,
  organizationProjectsAuditLogs,
} from '../schemas/organization-projects.schema';
import {
  organizationRoles,
  organizationRolesAuditLogs,
} from '../schemas/organization-roles.schema';
import { organizationTagAuditLogs, organizationTags } from '../schemas/organization-tags.schema';
import {
  organizationUsers,
  organizationUsersAuditLogs,
} from '../schemas/organization-users.schema';
import { organizationAuditLogs, organizations } from '../schemas/organizations.schema';
import { permissionTagAuditLogs, permissionTags } from '../schemas/permission-tags.schema';
import { permissionAuditLogs, permissions } from '../schemas/permissions.schema';
import { projectGroupAuditLogs, projectGroups } from '../schemas/project-groups.schema';
import { projectRoleAuditLogs, projectRoles } from '../schemas/project-roles.schema';
import { projectTagAuditLogs, projectTags } from '../schemas/project-tags.schema';
import { projectUserAuditLogs, projectUsers } from '../schemas/project-users.schema';
import { projectAuditLogs, projects } from '../schemas/projects.schema';
import { roleGroups, roleGroupsAuditLogs } from '../schemas/role-groups.schema';
import { roleTagAuditLogs, roleTags } from '../schemas/role-tags.schema';
import { roleAuditLogs, roles } from '../schemas/roles.schema';
import { tagAuditLogs, tags } from '../schemas/tags.schema';
import {
  userAuthenticationMethods,
  userAuthenticationMethodsAuditLogs,
} from '../schemas/user-authentication-methods.schema';
import { userRoles, userRolesAuditLogs } from '../schemas/user-roles.schema';
import { userSessionAuditLogs, userSessions } from '../schemas/user-sessions.schema';
import { userAuditLogs, users } from '../schemas/users.schema';

export const resetTables = {
  accountProjects,
  accountProjectsAuditLogs,
  accounts,
  accountAuditLogs,
  groupPermissions,
  groupPermissionsAuditLogs,
  groupTags,
  groupTagsAuditLogs,
  groups,
  groupAuditLogs,
  organizationGroups,
  organizationGroupsAuditLogs,
  organizationInvitations,
  organizationInvitationsAuditLogs,
  organizationPermissions,
  organizationPermissionsAuditLogs,
  organizationProjects,
  organizationProjectsAuditLogs,
  organizationRoles,
  organizationRolesAuditLogs,
  organizationTags,
  organizationTagAuditLogs,
  organizationUsers,
  organizationUsersAuditLogs,
  organizations,
  organizationAuditLogs,
  permissionTags,
  permissionTagAuditLogs,
  permissions,
  permissionAuditLogs,
  projectGroups,
  projectGroupAuditLogs,
  projectPermissions,
  projectPermissionsAuditLogs,
  projectRoles,
  projectRoleAuditLogs,
  projectTags,
  projectTagAuditLogs,
  projectUsers,
  projectUserAuditLogs,
  projects,
  projectAuditLogs,
  roleGroups,
  roleGroupsAuditLogs,
  roleTags,
  roleTagAuditLogs,
  roles,
  roleAuditLogs,
  tags,
  tagAuditLogs,
  userAuthenticationMethods,
  userAuthenticationMethodsAuditLogs,
  userRoles,
  userRolesAuditLogs,
  userSessions,
  userSessionAuditLogs,
  userTags,
  userTagsAuditLogs,
  users,
  userAuditLogs,
};

async function main() {
  console.log('🗑️ Starting database reset...');

  try {
    const connectionString = resolveDatabaseUrl(getEnv());
    if (!connectionString) {
      console.error('❌ Error: DB_URL or POSTGRES_* environment variables are required');
      process.exit(1);
    }

    const db = initializeDBConnection({ connectionString });

    console.log('🧹 Resetting database tables...');
    await reset(db, resetTables);

    console.log('✅ Database reset completed successfully!');
    console.log('📝 All tables have been cleared and are ready for new data.');
  } catch (error) {
    console.error('❌ Error during database reset:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
    process.exit(0);
  }
}

// Run only when executed as CLI entry point (e.g. pnpm db:reset), not when imported for resetTables
if (process.argv[1]?.endsWith('reset-db.ts') || process.argv[1]?.includes('reset-db')) {
  main();
}
