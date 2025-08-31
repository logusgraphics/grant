import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { ProjectUserRepository } from './repository';

export function createProjectUserRepository(db: PostgresJsDatabase) {
  return new ProjectUserRepository(db);
}
