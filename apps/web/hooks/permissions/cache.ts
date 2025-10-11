import { ApolloCache } from '@apollo/client';

export const evictPermissionsCache = (cache: ApolloCache) => {
  cache.evict({ fieldName: 'permissions' });
  cache.gc();
};
