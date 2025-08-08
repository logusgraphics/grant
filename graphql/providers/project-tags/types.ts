import {
  MutationAddProjectTagArgs,
  MutationRemoveProjectTagArgs,
  ProjectTag,
} from '@/graphql/generated/types';

export type GetProjectTagsParams = { projectId: string };
export type GetProjectTagsResult = ProjectTag[];

export type AddProjectTagParams = MutationAddProjectTagArgs;
export type AddProjectTagResult = ProjectTag;

export type RemoveProjectTagParams = MutationRemoveProjectTagArgs;
export type RemoveProjectTagResult = boolean;

export interface ProjectTagDataProvider {
  getProjectTags(params: GetProjectTagsParams): Promise<GetProjectTagsResult>;
  addProjectTag(params: AddProjectTagParams): Promise<AddProjectTagResult>;
  removeProjectTag(params: RemoveProjectTagParams): Promise<RemoveProjectTagResult>;
}
