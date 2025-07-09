import { RoleGroupDataProvider } from '@/graphql/providers/role-groups/types';
import { getRoleGroups } from '@/graphql/providers/role-groups/faker/getRoleGroups';
import { addRoleGroup } from '@/graphql/providers/role-groups/faker/addRoleGroup';
import { removeRoleGroup } from '@/graphql/providers/role-groups/faker/removeRoleGroup';

export const roleGroupFakerProvider: RoleGroupDataProvider = {
  getRoleGroups,
  addRoleGroup,
  removeRoleGroup,
};
