import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { OrganizationGroupRepository } from './repository';

export function createOrganizationGroupRepository(db: PostgresJsDatabase) {
  return new OrganizationGroupRepository(db);
}
