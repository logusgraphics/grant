import { ApolloCache } from '@apollo/client';

export function evictRolesCache(cache: ApolloCache<any>) {
  // Invalidate all role queries to force a refetch
  cache.evict({ fieldName: 'roles' });
}
