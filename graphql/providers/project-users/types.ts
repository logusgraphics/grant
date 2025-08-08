import {
  MutationAddProjectUserArgs,
  MutationRemoveProjectUserArgs,
  ProjectUser,
} from '@/graphql/generated/types';

export type GetProjectUsersParams = { projectId: string };
export type GetProjectUsersResult = ProjectUser[];

export type AddProjectUserParams = MutationAddProjectUserArgs;
export type AddProjectUserResult = ProjectUser;

export type RemoveProjectUserParams = MutationRemoveProjectUserArgs;
export type RemoveProjectUserResult = boolean;

export interface ProjectUserDataProvider {
  getProjectUsers(params: GetProjectUsersParams): Promise<GetProjectUsersResult>;
  addProjectUser(params: AddProjectUserParams): Promise<AddProjectUserResult>;
  removeProjectUser(params: RemoveProjectUserParams): Promise<RemoveProjectUserResult>;
}
