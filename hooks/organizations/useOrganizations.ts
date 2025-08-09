import { useMemo } from 'react';

import { useQuery, ApolloError } from '@apollo/client';

import {
  Organization,
  OrganizationSortableField,
  OrganizationSortOrder,
  QueryOrganizationsArgs,
} from '@/graphql/generated/types';

import { GET_ORGANIZATIONS } from './queries';

interface UseOrganizationsResult {
  organizations: Organization[];
  loading: boolean;
  error: ApolloError | undefined;
  totalCount: number;
  refetch: () => Promise<any>;
}

export function useOrganizations(options: QueryOrganizationsArgs): UseOrganizationsResult {
  const {
    page = 1,
    limit = 50, // Default to 50 for pagination
    search = '',
    sort = { field: OrganizationSortableField.Name, order: OrganizationSortOrder.Asc },
    ids,
  } = options;

  // Memoize variables to prevent unnecessary re-renders
  const variables = useMemo(
    () => ({
      page,
      limit,
      search,
      sort,
      ids,
    }),
    [page, limit, search, sort, ids]
  );

  const { data, loading, error, refetch } = useQuery(GET_ORGANIZATIONS, {
    variables,
    notifyOnNetworkStatusChange: false, // Prevent re-renders on network status changes
  });

  return {
    organizations: data?.organizations?.organizations || [],
    loading,
    error,
    totalCount: data?.organizations?.totalCount || 0,
    refetch,
  };
}
