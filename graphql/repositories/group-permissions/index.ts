import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { GroupPermissionRepository } from './repository';

export function createGroupPermissionRepository(db: PostgresJsDatabase) {
  return new GroupPermissionRepository(db);
}
