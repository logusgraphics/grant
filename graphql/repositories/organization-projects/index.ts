import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { OrganizationProjectRepository } from './repository';

export function createOrganizationProjectRepository(db: PostgresJsDatabase) {
  return new OrganizationProjectRepository(db);
}
