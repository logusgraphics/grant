import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { EntityCache } from '@/graphql/lib/scopeFiltering';
import { Services } from '@/graphql/services';

import { OrganizationController } from './controller';

export function createOrganizationController(
  scopeCache: EntityCache,
  services: Services,
  db: PostgresJsDatabase
) {
  return new OrganizationController(scopeCache, services, db);
}
