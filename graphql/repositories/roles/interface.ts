import {
  QueryRolesArgs,
  MutationCreateRoleArgs,
  MutationUpdateRoleArgs,
  MutationDeleteRoleArgs,
  Role,
  RolePage,
} from '@/graphql/generated/types';

export interface IRoleRepository {
  getRoles(
    params: Omit<QueryRolesArgs, 'scope'> & { requestedFields?: Array<keyof any> }
  ): Promise<RolePage>;
  createRole(params: MutationCreateRoleArgs): Promise<Role>;
  updateRole(params: MutationUpdateRoleArgs): Promise<Role>;
  softDeleteRole(params: MutationDeleteRoleArgs): Promise<Role>;
  hardDeleteRole(params: MutationDeleteRoleArgs): Promise<Role>;
}
