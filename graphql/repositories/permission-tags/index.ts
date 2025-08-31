import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { PermissionTagRepository } from './repository';

export function createPermissionTagRepository(db: PostgresJsDatabase) {
  return new PermissionTagRepository(db);
}
