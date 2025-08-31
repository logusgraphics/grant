import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { OrganizationTagRepository } from './repository';

export function createOrganizationTagRepository(db: PostgresJsDatabase) {
  return new OrganizationTagRepository(db);
}
