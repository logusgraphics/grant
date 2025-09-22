import { DbSchema } from '@/graphql/lib/database/connection';

import { UserSessionRepository } from './repository';

export * from './schema';
export * from './repository';

export function createUserSessionRepository(db: DbSchema) {
  return new UserSessionRepository(db);
}
