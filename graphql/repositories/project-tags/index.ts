import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { ProjectTagRepository } from './repository';

export function createProjectTagRepository(db: PostgresJsDatabase) {
  return new ProjectTagRepository(db);
}
