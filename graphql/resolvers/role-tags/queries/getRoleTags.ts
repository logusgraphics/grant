import { QueryResolvers } from '@/graphql/generated/types';
import { getScopedTagIds, getScopedRoleIds } from '@/graphql/lib/scopeFiltering';

export const getRoleTagsResolver: QueryResolvers['roleTags'] = async (
  _parent,
  { roleId, scope },
  context
) => {
  const [scopedTagIds, scopedRoleIds] = await Promise.all([
    getScopedTagIds({ scope, context }),
    getScopedRoleIds({ scope, context }),
  ]);

  if (!scopedRoleIds.includes(roleId)) {
    return [];
  }

  const roleTags = await context.services.roleTags.getRoleTags({
    roleId,
  });

  const filteredRoleTags = roleTags.filter((rt) => scopedTagIds.includes(rt.tagId));

  return filteredRoleTags;
};
