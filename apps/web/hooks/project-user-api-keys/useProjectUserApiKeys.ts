import { useMemo } from 'react';

import { ApolloClient } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import {
  GetProjectUserApiKeysDocument,
  ProjectUserApiKey,
  ProjectUserApiKeyPage,
  QueryProjectUserApiKeysArgs,
} from '@logusgraphics/grant-schema';

interface UseProjectUserApiKeysResult {
  projectUserApiKeys: ProjectUserApiKey[];
  loading: boolean;
  error: Error | undefined;
  totalCount: number;
  hasNextPage: boolean;
  refetch: (
    variables?: Partial<QueryProjectUserApiKeysArgs>
  ) => Promise<ApolloClient.QueryResult<{ projectUserApiKeys: ProjectUserApiKeyPage }>>;
}

export function useProjectUserApiKeys(
  params: QueryProjectUserApiKeysArgs
): UseProjectUserApiKeysResult {
  const { projectId, userId, limit, page, search, sort } = params;

  const skip = useMemo(() => !projectId || !userId, [projectId, userId]);

  const variables = useMemo(
    () => ({
      projectId,
      userId,
      limit,
      page,
      search,
      sort,
    }),
    [projectId, userId, limit, page, search, sort]
  );

  const { data, loading, error, refetch } = useQuery<{ projectUserApiKeys: ProjectUserApiKeyPage }>(
    GetProjectUserApiKeysDocument,
    {
      variables,
      skip,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    }
  );

  const { projectUserApiKeys, totalCount, hasNextPage } = useMemo(
    () => ({
      projectUserApiKeys: data?.projectUserApiKeys?.projectUserApiKeys ?? [],
      totalCount: data?.projectUserApiKeys?.totalCount ?? 0,
      hasNextPage: data?.projectUserApiKeys?.hasNextPage ?? false,
    }),
    [data]
  );

  return {
    projectUserApiKeys,
    loading,
    error,
    totalCount,
    hasNextPage,
    refetch,
  };
}
