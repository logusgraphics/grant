import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { OrganizationPermissionRepository } from './repository';

export function createOrganizationPermissionRepository(db: PostgresJsDatabase) {
  return new OrganizationPermissionRepository(db);
}
