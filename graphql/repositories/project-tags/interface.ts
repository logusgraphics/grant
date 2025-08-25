import {
  QueryProjectTagsArgs,
  MutationAddProjectTagArgs,
  MutationRemoveProjectTagArgs,
  ProjectTag,
} from '@/graphql/generated/types';

export interface IProjectTagRepository {
  getProjectTags(params: QueryProjectTagsArgs): Promise<ProjectTag[]>;
  addProjectTag(params: MutationAddProjectTagArgs): Promise<ProjectTag>;
  softDeleteProjectTag(params: MutationRemoveProjectTagArgs): Promise<ProjectTag>;
  hardDeleteProjectTag(params: MutationRemoveProjectTagArgs): Promise<ProjectTag>;
}
