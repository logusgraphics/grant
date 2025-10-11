import { ApolloCache } from '@apollo/client';

export function evictOrganizationsCache(cache: ApolloCache) {
  cache.evict({ fieldName: 'organizations' });
  cache.gc();
}
