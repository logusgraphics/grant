import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { UserRepository } from './repository';

export function createUserRepository(db: PostgresJsDatabase) {
  return new UserRepository(db);
}
