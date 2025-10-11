import { ApolloCache } from '@apollo/client';

export const evictGroupsCache = (cache: ApolloCache) => {
  cache.evict({ fieldName: 'groups' });
  cache.gc();
};
