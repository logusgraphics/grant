import { QueryResolvers } from '@/graphql/generated/types';
import { getScopedRoleIds, getScopedGroupIds } from '@/graphql/lib/scopeFiltering';

export const getRoleGroupsResolver: QueryResolvers['roleGroups'] = async (
  _parent,
  { roleId, scope },
  context
) => {
  const [scopedRoleIds, scopedGroupIds] = await Promise.all([
    getScopedRoleIds({ scope, context }),
    getScopedGroupIds({ scope, context }),
  ]);

  if (!scopedRoleIds.includes(roleId)) {
    return [];
  }

  const roleGroups = await context.services.roleGroups.getRoleGroups({
    roleId,
  });

  const filteredRoleGroups = roleGroups.filter((rg) => scopedGroupIds.includes(rg.groupId));

  return filteredRoleGroups;
};
