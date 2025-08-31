import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { ProjectRoleRepository } from './repository';

export function createProjectRoleRepository(db: PostgresJsDatabase) {
  return new ProjectRoleRepository(db);
}
