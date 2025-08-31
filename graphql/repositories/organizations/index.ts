import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { OrganizationRepository } from './repository';

export function createOrganizationRepository(db: PostgresJsDatabase) {
  return new OrganizationRepository(db);
}
