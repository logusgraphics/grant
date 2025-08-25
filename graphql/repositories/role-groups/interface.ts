import { RoleGroup, QueryRoleGroupsArgs } from '@/graphql/generated/types';

export interface IRoleGroupRepository {
  getRoleGroups(params: Omit<QueryRoleGroupsArgs, 'scope'>): Promise<RoleGroup[]>;
  addRoleGroup(roleId: string, groupId: string): Promise<RoleGroup>;
  softDeleteRoleGroup(roleId: string, groupId: string): Promise<RoleGroup>;
  hardDeleteRoleGroup(roleId: string, groupId: string): Promise<RoleGroup>;
}
