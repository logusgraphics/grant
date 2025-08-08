import { useMemo } from 'react';

import { useQuery } from '@apollo/client';

import { ProjectSortableField, ProjectSortOrder } from '@/graphql/generated/types';

import { GET_PROJECTS } from './queries';

export interface UseProjectsOptions {
  organizationId: string; // Required parameter
  page?: number;
  limit?: number;
  search?: string;
  sort?: {
    field: ProjectSortableField;
    order: ProjectSortOrder;
  };
  ids?: string[];
}

export interface UseProjectsResult {
  projects: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  loading: boolean;
  error: any;
  totalCount: number;
  refetch: () => void;
}

export function useProjects(options: UseProjectsOptions): UseProjectsResult {
  const {
    organizationId,
    page = 1,
    limit = 50,
    search = '',
    sort = { field: ProjectSortableField.Name, order: ProjectSortOrder.Asc },
    ids,
  } = options;

  // Memoize variables to prevent unnecessary re-renders
  const variables = useMemo(
    () => ({
      organizationId,
      page,
      limit,
      search,
      sort,
      ids,
    }),
    [organizationId, page, limit, search, sort, ids]
  );

  const { data, loading, error, refetch } = useQuery(GET_PROJECTS, {
    variables,
    notifyOnNetworkStatusChange: false, // Prevent re-renders on network status changes
  });

  return {
    projects: data?.projects?.projects || [],
    loading,
    error,
    totalCount: data?.projects?.totalCount || 0,
    refetch,
  };
}
