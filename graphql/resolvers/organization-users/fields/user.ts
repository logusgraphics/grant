import { OrganizationUserResolvers, Tenant } from '@/graphql/generated/types';

export const organizationUserUserResolver: OrganizationUserResolvers['user'] = async (
  parent,
  _args,
  context
) => {
  // Get the user by userId (optimized - no need to fetch all users)
  const usersResult = await context.providers.users.getUsers({
    ids: [parent.userId],
    scope: {
      tenant: Tenant.Organization,
      id: parent.organizationId,
    },
    limit: -1,
  });

  const user = usersResult.users[0];

  if (!user) {
    throw new Error(`User with ID ${parent.userId} not found`);
  }

  return user;
};
