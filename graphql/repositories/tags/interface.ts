import {
  QueryTagsArgs,
  MutationCreateTagArgs,
  MutationUpdateTagArgs,
  MutationDeleteTagArgs,
  Tag,
  TagPage,
} from '@/graphql/generated/types';

export interface ITagRepository {
  getTags(params: Omit<QueryTagsArgs, 'scope'> & { requestedFields?: string[] }): Promise<TagPage>;
  createTag(params: MutationCreateTagArgs): Promise<Tag>;
  updateTag(params: MutationUpdateTagArgs): Promise<Tag>;
  softDeleteTag(params: MutationDeleteTagArgs): Promise<Tag>;
  hardDeleteTag(params: MutationDeleteTagArgs): Promise<Tag>;
}
