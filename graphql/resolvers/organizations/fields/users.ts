import { OrganizationResolvers, Tenant } from '@/graphql/generated/types';

export const organizationUsersResolver: OrganizationResolvers['users'] = async (
  parent,
  _args,
  context
) => {
  const organizationId = parent.id;
  // Get organization-user relationships for this organization
  const organizationUsers = await context.providers.organizationUsers.getOrganizationUsers({
    organizationId,
  });

  // Extract user IDs from organization-user relationships
  const userIds = organizationUsers.map((ou) => ou.userId);

  if (userIds.length === 0) {
    return [];
  }

  // Get all users with limit -1
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
