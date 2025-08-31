import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { TagRepository } from './repository';

export function createTagRepository(db: PostgresJsDatabase) {
  return new TagRepository(db);
}
