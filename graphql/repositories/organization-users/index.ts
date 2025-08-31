import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { OrganizationUserRepository } from './repository';

export function createOrganizationUserRepository(db: PostgresJsDatabase) {
  return new OrganizationUserRepository(db);
}
