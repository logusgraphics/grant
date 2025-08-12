import { ApolloCache } from '@apollo/client';

export function evictOrganizationRolesCache(cache: ApolloCache<any>) {
  cache.evict({ fieldName: 'organizationRoles' });
  cache.gc();
}
