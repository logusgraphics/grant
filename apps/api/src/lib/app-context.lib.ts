import { Grant } from '@grantjs/core';
import { DbSchema } from '@grantjs/database';

import { config } from '@/config';
import { SYSTEM_USER } from '@/constants/system.constants';
import { createRepositories } from '@/repositories';
import { GrantRepository } from '@/repositories/grant.repository';
import { createServices } from '@/services';
import { GrantService } from '@/services/grant.service';
import { SigningKeyService } from '@/services/signing-keys.service';
import type { AppContext } from '@/types';

import { IEntityCacheAdapter } from './cache';

export function createAppContext(db: DbSchema, cache: IEntityCacheAdapter): AppContext {
  const repositories = createRepositories(db);
  const grantRepository = new GrantRepository(db);
  const globalSigningKeyService = new SigningKeyService(repositories, SYSTEM_USER, db);
  const grantService = new GrantService(cache, grantRepository, globalSigningKeyService, {
    cacheTtlSeconds: config.jwt.systemSigningKeyCacheTtlSeconds,
  });
  const grant = new Grant(grantService);
  const services = createServices(repositories, SYSTEM_USER, db, cache, grant);
  return {
    services,
    db,
    grant,
  };
}
