import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { EntityCache } from '@/graphql/lib/scopeFiltering';
import { Services } from '@/graphql/services';

import { TagController } from './controller';

export function createTagController(
  scopeCache: EntityCache,
  services: Services,
  db: PostgresJsDatabase
) {
  return new TagController(scopeCache, services, db);
}
