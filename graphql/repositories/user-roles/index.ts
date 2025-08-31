import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { UserRoleRepository } from './repository';

export function createUserRoleRepository(db: PostgresJsDatabase) {
  return new UserRoleRepository(db);
}
