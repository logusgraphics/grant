import {
  MutationAddProjectUserArgs,
  MutationRemoveProjectUserArgs,
  ProjectUser,
  QueryProjectUsersArgs,
} from '@/graphql/generated/types';

export interface IProjectUserService {
  getProjectUsers(params: Omit<QueryProjectUsersArgs, 'scope'>): Promise<ProjectUser[]>;
  addProjectUser(params: MutationAddProjectUserArgs): Promise<ProjectUser>;
  removeProjectUser(
    params: MutationRemoveProjectUserArgs & { hardDelete?: boolean }
  ): Promise<ProjectUser>;
}
