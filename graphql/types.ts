import { GraphQLResolveInfo } from 'graphql';

import { ModuleProviders } from './config/providers/interface';
import { ModuleServices } from './config/services/interface';
import { EntityCache } from './lib/scopeFiltering';

export interface AuthenticatedUser {
  id: string;
  email: string;
  sub: string; // JWT subject claim
}

export interface Context {
  providers: ModuleProviders;
  services: ModuleServices;
  scopeCache?: EntityCache;
  info?: GraphQLResolveInfo;
  user?: AuthenticatedUser; // Current authenticated user
}
