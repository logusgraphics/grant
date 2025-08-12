import { OrganizationResolvers, Tenant } from '@/graphql/generated/types';
export const organizationUsersResolver: OrganizationResolvers['users'] = async (
  parent,
  _args,
  context
) => {
  const organizationId = parent.id;
  const organizationUsers = await context.providers.organizationUsers.getOrganizationUsers({
    organizationId,
  });
  const userIds = organizationUsers.map((ou) => ou.userId);
  if (userIds.length === 0) {
    return [];
  }
  const usersResult = await context.providers.users.getUsers({
    ids: userIds,
    scope: {
      tenant: Tenant.Organization,
      id: organizationId,
    },
    limit: -1,
  });
  return usersResult.users;
};
