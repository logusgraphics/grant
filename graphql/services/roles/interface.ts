import {
  QueryRolesArgs,
  MutationCreateRoleArgs,
  MutationUpdateRoleArgs,
  MutationDeleteRoleArgs,
  Role,
  RolePage,
} from '@/graphql/generated/types';

export interface IRoleService {
  getRoles(
    params: Omit<QueryRolesArgs, 'scope'> & { requestedFields?: string[] }
  ): Promise<RolePage>;
  createRole(params: MutationCreateRoleArgs): Promise<Role>;
  updateRole(params: MutationUpdateRoleArgs): Promise<Role>;
  deleteRole(params: MutationDeleteRoleArgs & { hardDelete?: boolean }): Promise<Role>;
}
