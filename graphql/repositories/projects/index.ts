import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { ProjectRepository } from './repository';

export function createProjectRepository(db: PostgresJsDatabase) {
  return new ProjectRepository(db);
}
