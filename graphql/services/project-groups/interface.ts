import {
  QueryProjectGroupsArgs,
  MutationAddProjectGroupArgs,
  MutationRemoveProjectGroupArgs,
  ProjectGroup,
} from '@/graphql/generated/types';

export interface IProjectGroupService {
  getProjectGroups(params: QueryProjectGroupsArgs): Promise<ProjectGroup[]>;
  addProjectGroup(params: MutationAddProjectGroupArgs): Promise<ProjectGroup>;
  removeProjectGroup(
    params: MutationRemoveProjectGroupArgs & { hardDelete?: boolean }
  ): Promise<ProjectGroup>;
}
