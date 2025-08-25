import {
  MutationAddRoleGroupArgs,
  MutationRemoveRoleGroupArgs,
  RoleGroup,
  QueryRoleGroupsArgs,
} from '@/graphql/generated/types';

export interface IRoleGroupService {
  getRoleGroups(params: Omit<QueryRoleGroupsArgs, 'scope'>): Promise<RoleGroup[]>;
  addRoleGroup(params: MutationAddRoleGroupArgs): Promise<RoleGroup>;
  removeRoleGroup(params: MutationRemoveRoleGroupArgs): Promise<RoleGroup>;
}
