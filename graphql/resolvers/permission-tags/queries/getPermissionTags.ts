import { QueryResolvers } from '@/graphql/generated/types';
import { getScopedTagIds, getScopedPermissionIds } from '@/graphql/lib/scopeFiltering';

export const getPermissionTagsResolver: QueryResolvers['permissionTags'] = async (
  _parent,
  { permissionId, scope },
  context
) => {
  const [scopedTagIds, scopedPermissionIds] = await Promise.all([
    getScopedTagIds({ scope, context }),
    getScopedPermissionIds({ scope, context }),
  ]);

  if (!scopedPermissionIds.includes(permissionId)) {
    return [];
  }

  const permissionTags = await context.services.permissionTags.getPermissionTags({
    permissionId,
  });

  const filteredPermissionTags = permissionTags.filter((pt) => scopedTagIds.includes(pt.tagId));

  return filteredPermissionTags;
};
