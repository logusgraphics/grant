import { TagDataProvider } from '@/graphql/providers/tags/types';
import { getTags } from '@/graphql/providers/tags/faker/getTags';
import { createTag } from '@/graphql/providers/tags/faker/createTag';
import { updateTag } from '@/graphql/providers/tags/faker/updateTag';
import { deleteTag } from '@/graphql/providers/tags/faker/deleteTag';

export const tagFakerProvider: TagDataProvider = {
  getTags,
  createTag,
  updateTag,
  deleteTag,
};
