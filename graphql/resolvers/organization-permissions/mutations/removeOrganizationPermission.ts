import { MutationResolvers } from '@/graphql/generated/types';
export const removeOrganizationPermissionResolver: MutationResolvers['removeOrganizationPermission'] =
  async (_parent, { input }, context) => {
    const removedOrganizationPermission =
      await context.services.organizationPermissions.removeOrganizationPermission({
        input,
      });
    return removedOrganizationPermission;
  };
