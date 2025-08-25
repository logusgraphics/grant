import { OrganizationResolvers, Tenant } from '@/graphql/generated/types';
import { getScopedGroupIds } from '@/graphql/lib/scopeFiltering';

export const organizationGroupsResolver: OrganizationResolvers['groups'] = async (
  parent,
  _args,
  context
) => {
  const organizationId = parent.id;

  const organizationGroups = await context.services.organizationGroups.getOrganizationGroups({
    organizationId,
  });

  const groupIds = organizationGroups.map((og) => og.groupId);

  if (groupIds.length === 0) {
    return [];
  }

  const scope = { tenant: Tenant.Organization, id: organizationId };
  const scopedGroupIds = await getScopedGroupIds({ scope, context });

  const filteredGroupIds = groupIds.filter((groupId) => scopedGroupIds.includes(groupId));

  if (filteredGroupIds.length === 0) {
    return [];
  }

  const groupsResult = await context.services.groups.getGroups({
    ids: filteredGroupIds,
    limit: -1,
  });

  return groupsResult.groups;
};
