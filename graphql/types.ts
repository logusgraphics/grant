import { GraphQLResolveInfo } from 'graphql';

import { ModuleProviders } from './config/providers/interface';
import { Controllers } from './controllers';
import { EntityCache } from './lib/scopeFiltering';
import { Services } from './services';

export interface AuthenticatedUser {
  id: string;
  sub: string;
}

export interface Context {
  providers: ModuleProviders;
  services: Services;
  controllers: Controllers;
  scopeCache: EntityCache;
  info?: GraphQLResolveInfo;
  user: AuthenticatedUser | null;
}
