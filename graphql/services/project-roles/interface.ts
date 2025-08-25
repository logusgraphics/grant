import {
  QueryProjectRolesArgs,
  MutationAddProjectRoleArgs,
  MutationRemoveProjectRoleArgs,
  ProjectRole,
} from '@/graphql/generated/types';

export interface IProjectRoleService {
  getProjectRoles(params: QueryProjectRolesArgs): Promise<ProjectRole[]>;
  addProjectRole(params: MutationAddProjectRoleArgs): Promise<ProjectRole>;
  removeProjectRole(
    params: MutationRemoveProjectRoleArgs & { hardDelete?: boolean }
  ): Promise<ProjectRole>;
}
