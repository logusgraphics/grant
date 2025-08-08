import {
  MutationAddProjectRoleArgs,
  MutationRemoveProjectRoleArgs,
  ProjectRole,
} from '@/graphql/generated/types';

export type GetProjectRolesParams = { projectId: string };
export type GetProjectRolesResult = ProjectRole[];

export type AddProjectRoleParams = MutationAddProjectRoleArgs;
export type AddProjectRoleResult = ProjectRole;

export type RemoveProjectRoleParams = MutationRemoveProjectRoleArgs;
export type RemoveProjectRoleResult = boolean;

export interface ProjectRoleDataProvider {
  getProjectRoles(params: GetProjectRolesParams): Promise<GetProjectRolesResult>;
  addProjectRole(params: AddProjectRoleParams): Promise<AddProjectRoleResult>;
  removeProjectRole(params: RemoveProjectRoleParams): Promise<RemoveProjectRoleResult>;
}
