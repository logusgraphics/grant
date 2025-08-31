import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { ProjectPermissionRepository } from './repository';

export function createProjectPermissionRepository(db: PostgresJsDatabase) {
  return new ProjectPermissionRepository(db);
}
