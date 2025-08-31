import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { ProjectGroupRepository } from './repository';

export function createProjectGroupRepository(db: PostgresJsDatabase) {
  return new ProjectGroupRepository(db);
}
