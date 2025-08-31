import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { GroupTagRepository } from './repository';

export function createGroupTagRepository(db: PostgresJsDatabase) {
  return new GroupTagRepository(db);
}
