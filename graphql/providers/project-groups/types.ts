import {
  MutationAddProjectGroupArgs,
  MutationRemoveProjectGroupArgs,
  ProjectGroup,
} from '@/graphql/generated/types';

export type GetProjectGroupsParams = { projectId: string };
export type GetProjectGroupsResult = ProjectGroup[];

export type AddProjectGroupParams = MutationAddProjectGroupArgs;
export type AddProjectGroupResult = ProjectGroup;

export type RemoveProjectGroupParams = MutationRemoveProjectGroupArgs;
export type RemoveProjectGroupResult = boolean;

export interface ProjectGroupDataProvider {
  getProjectGroups(params: GetProjectGroupsParams): Promise<GetProjectGroupsResult>;
  addProjectGroup(params: AddProjectGroupParams): Promise<AddProjectGroupResult>;
  removeProjectGroup(params: RemoveProjectGroupParams): Promise<RemoveProjectGroupResult>;
}
