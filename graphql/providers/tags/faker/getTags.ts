import { GetTagsParams, GetTagsResult, TagData } from '@/graphql/providers/tags/types';
import { getTags as getTagsFromStore } from './dataStore';

export const getTags = async (params: GetTagsParams): Promise<GetTagsResult> => {
  const { page = 1, pageSize = 10, sort } = params;

  // Get all tags with sorting
  const allTags = getTagsFromStore(sort);

  // Calculate pagination
  const totalCount = allTags.length;
  const actualPage = page || 1;
  const actualPageSize = pageSize || 10;
  const startIndex = (actualPage - 1) * actualPageSize;
  const endIndex = startIndex + actualPageSize;
  const tags = allTags.slice(startIndex, endIndex);

  return {
    tags,
    totalCount,
    hasNextPage: endIndex < totalCount,
  };
};
