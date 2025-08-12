import { OrganizationResolvers, Tenant } from '@/graphql/generated/types';
export const organizationGroupsResolver: OrganizationResolvers['groups'] = async (
  parent,
  _args,
  context
) => {
  const organizationId = parent.id;
  const organizationGroups = await context.providers.organizationGroups.getOrganizationGroups({
    organizationId,
  });
  const groupIds = organizationGroups.map((og) => og.groupId);
  if (groupIds.length === 0) {
    return [];
  }
  const groupsResult = await context.providers.groups.getGroups({
    ids: groupIds,
    scope: {
      tenant: Tenant.Organization,
      id: organizationId,
    },
    limit: -1,
  });
  return groupsResult.groups;
};
