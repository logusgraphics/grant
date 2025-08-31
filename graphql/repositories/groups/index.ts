import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { GroupRepository } from './repository';

export function createGroupRepository(db: PostgresJsDatabase) {
  return new GroupRepository(db);
}
