import {
  MutationAddProjectUserArgs,
  MutationRemoveProjectUserArgs,
  ProjectUser,
  QueryProjectUsersArgs,
} from '@/graphql/generated/types';

export interface IProjectUserRepository {
  getProjectUsers(params: Omit<QueryProjectUsersArgs, 'scope'>): Promise<ProjectUser[]>;
  addProjectUser(params: MutationAddProjectUserArgs): Promise<ProjectUser>;
  softDeleteProjectUser(params: MutationRemoveProjectUserArgs): Promise<ProjectUser>;
  hardDeleteProjectUser(params: MutationRemoveProjectUserArgs): Promise<ProjectUser>;
}
