import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { EntityCache } from '@/graphql/lib/scopeFiltering';
import { Services } from '@/graphql/services';

import { GroupController } from './controller';

export function createGroupController(
  scopeCache: EntityCache,
  services: Services,
  db: PostgresJsDatabase
) {
  return new GroupController(scopeCache, services, db);
}
