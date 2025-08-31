import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { UserTagRepository } from './repository';

export function createUserTagRepository(db: PostgresJsDatabase) {
  return new UserTagRepository(db);
}
