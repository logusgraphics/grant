import {
  Tag,
  TagPage,
  CreateTagInput,
  UpdateTagInput,
  QueryTagsArgs,
  MutationCreateTagArgs,
  MutationUpdateTagArgs,
  MutationDeleteTagArgs,
} from '@/graphql/generated/types';

// Type for tag data without any resolved fields
export type TagData = Tag;

// Re-export the generated types for convenience
export type { Tag, TagPage, CreateTagInput, UpdateTagInput };

// Provider-specific parameter types
export type GetTagsParams = QueryTagsArgs;
export type CreateTagParams = MutationCreateTagArgs;
export type UpdateTagParams = MutationUpdateTagArgs;
export type DeleteTagParams = MutationDeleteTagArgs;

// Provider result types
export type GetTagsResult = TagPage;
export type CreateTagResult = Tag;
export type UpdateTagResult = Tag;
export type DeleteTagResult = Tag;

export interface TagDataProvider {
  getTags(params: GetTagsParams): Promise<GetTagsResult>;
  createTag(params: CreateTagParams): Promise<CreateTagResult>;
  updateTag(params: UpdateTagParams): Promise<UpdateTagResult>;
  deleteTag(params: DeleteTagParams): Promise<DeleteTagResult>;
}
