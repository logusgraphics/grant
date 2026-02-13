import type { Handlers } from '@/handlers';
import type { ResourceResolvers } from '@/resource-resolvers';
import type { Services } from '@/services';

import type { SupportedLocale } from '@grantjs/constants';
import type { Grant, GrantAuth } from '@grantjs/core';
import type { DbSchema } from '@grantjs/database';

export interface RequestContext {
  grant: Grant;
  user: GrantAuth | null;
  handlers: Handlers;
  resourceResolvers: ResourceResolvers;
  origin: string;
  locale: SupportedLocale;
  userAgent: string | null;
  ipAddress: string | null;
}

export interface AppContext {
  services: Services;
  db: DbSchema;
  grant: Grant;
}
