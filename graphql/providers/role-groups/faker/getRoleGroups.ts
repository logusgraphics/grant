import { GetRoleGroupsParams, GetRoleGroupsResult } from '@/graphql/providers/role-groups/types';
import { getRoleGroupsByRoleId } from '@/graphql/providers/role-groups/faker/dataStore';
import { RoleGroup } from '@/graphql/generated/types';

export async function getRoleGroups({ roleId }: GetRoleGroupsParams): Promise<GetRoleGroupsResult> {
  const roleGroupData = getRoleGroupsByRoleId(roleId);
  return roleGroupData as RoleGroup[]; // Convert RoleGroupData to RoleGroup for GraphQL
}
