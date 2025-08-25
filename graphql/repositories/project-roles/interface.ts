import {
  QueryProjectRolesArgs,
  MutationAddProjectRoleArgs,
  MutationRemoveProjectRoleArgs,
  ProjectRole,
} from '@/graphql/generated/types';

export interface IProjectRoleRepository {
  getProjectRoles(params: QueryProjectRolesArgs): Promise<ProjectRole[]>;
  addProjectRole(params: MutationAddProjectRoleArgs): Promise<ProjectRole>;
  softDeleteProjectRole(params: MutationRemoveProjectRoleArgs): Promise<ProjectRole>;
  hardDeleteProjectRole(params: MutationRemoveProjectRoleArgs): Promise<ProjectRole>;
}
