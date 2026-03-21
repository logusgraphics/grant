import { useMemo } from 'react';
import { ApolloClient } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Project, ProjectPage, QueryProjectsArgs, Scope } from '@grantjs/schema';
import { GetProjectsDocument } from '@grantjs/schema';

export type UseProjectsParams = Omit<QueryProjectsArgs, 'scope'> & {
  scope?: Scope;
  skip?: boolean;
};

interface UseProjectsResult {
  projects: Project[];
  loading: boolean;
  error: Error | undefined;
  totalCount: number;
  refetch: (
    variables?: Partial<QueryProjectsArgs>
  ) => Promise<ApolloClient.QueryResult<{ projects: ProjectPage }>>;
}

export function useProjects(params: UseProjectsParams): UseProjectsResult {
  const { scope, ids, limit, page, search, sort, tagIds, skip: skipParam } = params;

  const skip = useMemo(
    () => skipParam === true || !scope || !scope.id || !scope.tenant,
    [skipParam, scope]
  );

  const variables = useMemo((): QueryProjectsArgs => {
    if (skip || !scope) {
      return { scope: scope ?? ({} as Scope), ids, limit, page, search, sort, tagIds };
    }
    return { scope, ids, limit, page, search, sort, tagIds };
  }, [skip, scope, ids, limit, page, search, sort, tagIds]);

  const { data, loading, error, refetch } = useQuery<{ projects: ProjectPage }>(
    GetProjectsDocument,
    {
      variables,
      skip,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    }
  );

  const { projects, totalCount } = useMemo(
    () => ({
      projects: data?.projects?.projects ?? [],
      totalCount: data?.projects?.totalCount ?? 0,
    }),
    [data]
  );

  return {
    projects,
    loading,
    error,
    totalCount,
    refetch,
  };
}
