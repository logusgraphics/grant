import { ApolloCache } from '@apollo/client';

export function evictGroupPermissionsCache(cache: ApolloCache<any>) {
  cache.evict({ fieldName: 'groupPermissions' });
  cache.gc();
}
