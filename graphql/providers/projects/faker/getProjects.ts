import { ProjectPage, QueryProjectsArgs } from '@/graphql/generated/types';
import { getProjectTagsByTagId } from '@/graphql/providers/project-tags/faker/dataStore';
import { getProjects as getProjectsFromStore } from '@/graphql/providers/projects/faker/dataStore';

const SEARCHABLE_FIELDS = ['name', 'slug', 'description'] as const;

export async function getProjects({
  page,
  limit,
  search,
  sort,
  ids,
  tagIds,
}: QueryProjectsArgs): Promise<ProjectPage> {
  const safePage = typeof page === 'number' && page > 0 ? page : 1;
  const safeLimit = typeof limit === 'number' ? limit : 10;

  let allProjects =
    ids && ids.length > 0
      ? getProjectsFromStore(sort || undefined, ids)
      : getProjectsFromStore(sort || undefined);

  // Filter by tags if tagIds are provided
  if (tagIds && tagIds.length > 0) {
    const projectTagRelationships = tagIds.flatMap((tagId: string) => getProjectTagsByTagId(tagId));
    const projectIdsWithTags = [...new Set(projectTagRelationships.map((pt) => pt.projectId))];
    allProjects = allProjects.filter((project) => projectIdsWithTags.includes(project.id));
  }

  const filteredBySearchProjects = search
    ? allProjects.filter((project) =>
        SEARCHABLE_FIELDS.some((field) => {
          const value = project[field];
          return value && value.toLowerCase().includes(search.toLowerCase());
        })
      )
    : allProjects;

  const totalCount = filteredBySearchProjects.length;

  if (safeLimit <= 0) {
    return {
      projects: filteredBySearchProjects,
      totalCount,
      hasNextPage: false,
    };
  }

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
