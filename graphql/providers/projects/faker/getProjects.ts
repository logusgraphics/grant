import { getProjects as getProjectsFromStore } from '@/graphql/providers/projects/faker/dataStore';
import { GetProjectsParams, GetProjectsResult } from '@/graphql/providers/projects/types';

const SEARCHABLE_FIELDS = ['name', 'slug', 'description'] as const;

export async function getProjects({
  page,
  limit,
  search,
  sort,
  ids,
}: GetProjectsParams): Promise<GetProjectsResult> {
  // If ids are provided and not empty, ignore pagination and return filtered results
  if (ids && ids.length > 0) {
    const filteredProjects = getProjectsFromStore(sort || undefined, ids);
    return {
      projects: filteredProjects,
      totalCount: filteredProjects.length,
      hasNextPage: false, // No pagination when filtering by IDs
    };
  }

  const safePage = typeof page === 'number' && page > 0 ? page : 1;
  const safeLimit = typeof limit === 'number' && limit > 0 ? limit : 10;
  let allProjects = getProjectsFromStore(sort || undefined);

  // Filter by search term
  const filteredBySearchProjects = search
    ? allProjects.filter((project) =>
        SEARCHABLE_FIELDS.some((field) => {
          const value = project[field];
          return value && value.toLowerCase().includes(search.toLowerCase());
        })
      )
    : allProjects;

  // Calculate pagination
  const totalCount = filteredBySearchProjects.length;
  const hasNextPage = safePage < Math.ceil(totalCount / safeLimit);
  const startIndex = (safePage - 1) * safeLimit;
  const endIndex = startIndex + safeLimit;
  const projects = filteredBySearchProjects.slice(startIndex, endIndex);

  return {
    projects,
    totalCount,
    hasNextPage,
  };
}
