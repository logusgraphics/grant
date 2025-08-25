import {
  QueryTagsArgs,
  MutationCreateTagArgs,
  MutationUpdateTagArgs,
  MutationDeleteTagArgs,
  Tag,
  TagPage,
} from '@/graphql/generated/types';

export interface ITagService {
  getTags(params: Omit<QueryTagsArgs, 'scope'> & { requestedFields?: string[] }): Promise<TagPage>;
  createTag(params: MutationCreateTagArgs): Promise<Tag>;
  updateTag(params: MutationUpdateTagArgs): Promise<Tag>;
  deleteTag(params: MutationDeleteTagArgs & { hardDelete?: boolean }): Promise<Tag>;
}
