import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { PermissionRepository } from './repository';

export function createPermissionRepository(db: PostgresJsDatabase) {
  return new PermissionRepository(db);
}
