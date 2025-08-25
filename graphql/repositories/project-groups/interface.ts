import {
  QueryProjectGroupsArgs,
  MutationAddProjectGroupArgs,
  MutationRemoveProjectGroupArgs,
  ProjectGroup,
} from '@/graphql/generated/types';

export interface IProjectGroupRepository {
  getProjectGroups(params: QueryProjectGroupsArgs): Promise<ProjectGroup[]>;
  addProjectGroup(params: MutationAddProjectGroupArgs): Promise<ProjectGroup>;
  softDeleteProjectGroup(params: MutationRemoveProjectGroupArgs): Promise<ProjectGroup>;
  hardDeleteProjectGroup(params: MutationRemoveProjectGroupArgs): Promise<ProjectGroup>;
}
