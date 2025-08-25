import {
  QueryProjectTagsArgs,
  MutationAddProjectTagArgs,
  MutationRemoveProjectTagArgs,
  ProjectTag,
} from '@/graphql/generated/types';

export interface IProjectTagService {
  getProjectTags(params: QueryProjectTagsArgs): Promise<ProjectTag[]>;
  addProjectTag(params: MutationAddProjectTagArgs): Promise<ProjectTag>;
  removeProjectTag(
    params: MutationRemoveProjectTagArgs & { hardDelete?: boolean }
  ): Promise<ProjectTag>;
}
