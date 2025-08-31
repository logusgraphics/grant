import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { RoleRepository } from './repository';

export function createRoleRepository(db: PostgresJsDatabase) {
  return new RoleRepository(db);
}
