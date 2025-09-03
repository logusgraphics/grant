import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { EntityCache } from '@/graphql/lib/scopeFiltering';
import { Services } from '@/graphql/services';

import { UserController } from './controller';

export function createUserController(
  scopeCache: EntityCache,
  services: Services,
  db: PostgresJsDatabase
) {
  return new UserController(scopeCache, services, db);
}
