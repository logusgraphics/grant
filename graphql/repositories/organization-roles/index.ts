import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { OrganizationRoleRepository } from './repository';

export function createOrganizationRoleRepository(db: PostgresJsDatabase) {
  return new OrganizationRoleRepository(db);
}
