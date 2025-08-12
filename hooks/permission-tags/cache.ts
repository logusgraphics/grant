import { ApolloCache } from '@apollo/client';

export function evictPermissionTagsCache(cache: ApolloCache<any>) {
  cache.evict({ fieldName: 'permissionTags' });
  cache.gc();
}
