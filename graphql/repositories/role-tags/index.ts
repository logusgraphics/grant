import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { RoleTagRepository } from './repository';

export function createRoleTagRepository(db: PostgresJsDatabase) {
  return new RoleTagRepository(db);
}
