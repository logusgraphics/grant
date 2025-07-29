import { GroupSortableField, GroupSortOrder, Group } from '@/graphql/generated/types';
import { getGroupTagsByTagId } from '@/graphql/providers/group-tags/faker/dataStore';
import { getGroups as getGroupsFromDataStore } from '@/graphql/providers/groups/faker/dataStore';
import { GetGroupsParams, GetGroupsResult } from '@/graphql/providers/groups/types';

const SEARCHABLE_FIELDS = ['name', 'description'] as const;
const DEFAULT_SORT = { field: GroupSortableField.Name, order: GroupSortOrder.Asc };

export async function getGroups({
  page = 1,
  limit = 50,
  sort,
  search,
  ids,
  tagIds,
}: GetGroupsParams): Promise<GetGroupsResult> {
  // If ids are provided and not empty, ignore pagination and return filtered results
  if (ids && ids.length > 0) {
    const filteredGroups = getGroupsFromDataStore(sort || DEFAULT_SORT, ids);
    return {
      groups: filteredGroups as Group[],
      totalCount: filteredGroups.length,
      hasNextPage: false, // No pagination when filtering by IDs
    };
  }

  const safePage = typeof page === 'number' && page > 0 ? page : 1;
  const safeLimit = typeof limit === 'number' && limit > 0 ? limit : 50;
  let allGroups = getGroupsFromDataStore(sort || DEFAULT_SORT);

  // Filter by tag IDs if provided
  if (tagIds && tagIds.length > 0) {
    // Get all group-tag relationships for the specified tag IDs
    const groupTagRelationships = tagIds.flatMap((tagId: string) => getGroupTagsByTagId(tagId));

    // Extract unique group IDs that have at least one of the specified tags
    const groupIdsWithTags = [...new Set(groupTagRelationships.map((gt: any) => gt.groupId))];

    // Filter groups to only include those with the specified tags
    allGroups = allGroups.filter((group) => groupIdsWithTags.includes(group.id));
  }

  const filteredBySearchGroups = search
    ? allGroups.filter((group) =>
        SEARCHABLE_FIELDS.some((field) =>
          (group[field] ? String(group[field]).toLowerCase() : '').includes(search.toLowerCase())
        )
      )
    : allGroups;
  const totalCount = filteredBySearchGroups.length;
  const hasNextPage = safePage < Math.ceil(totalCount / safeLimit);
  const startIndex = (safePage - 1) * safeLimit;
  const endIndex = startIndex + safeLimit;
  const groups = filteredBySearchGroups.slice(startIndex, endIndex);

  return {
    groups: groups as Group[],
    totalCount,
    hasNextPage,
  };
}
