import { ResolverFn } from '@/graphql/generated/types';
import { Context } from '@/graphql/types';
export const createOrganizationFieldResolver =
  <T extends { organizationId: string }>(): ResolverFn<any, T, Context, any> =>
  async (parent, _args, context) => {
    const organizationsResult = await context.providers.organizations.getOrganizations({
      ids: [parent.organizationId],
    });
    const organization = organizationsResult.organizations[0];
    if (!organization) {
      throw new Error(`Organization with ID ${parent.organizationId} not found`);
    }
    return organization;
  };
