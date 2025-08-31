import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { RoleGroupRepository } from './repository';

export function createRoleGroupRepository(db: PostgresJsDatabase) {
  return new RoleGroupRepository(db);
}
