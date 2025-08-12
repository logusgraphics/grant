import { ResolverFn } from '@/graphql/generated/types';
import { Tenant } from '@/graphql/generated/types';
import { Context } from '@/graphql/types';
export const createTagFieldResolver =
  <T extends { tagId: string }>(
    scopeFactory: (parent: T) => { tenant: Tenant; id: string }
  ): ResolverFn<any, T, Context, any> =>
  async (parent, _args, context) => {
    const tagsResult = await context.providers.tags.getTags({
      ids: [parent.tagId],
      scope: scopeFactory(parent),
      limit: -1,
    });
    const tag = tagsResult.tags[0];
    if (!tag) {
      throw new Error(`Tag with ID ${parent.tagId} not found`);
    }
    return tag;
  };
export const createOrganizationTagFieldResolver = <
  T extends { tagId: string; organizationId: string },
>() =>
  createTagFieldResolver<T>((parent) => ({
    tenant: Tenant.Organization,
    id: parent.organizationId,
  }));
export const createProjectTagFieldResolver = <T extends { tagId: string; projectId: string }>() =>
  createTagFieldResolver<T>((parent) => ({
    tenant: Tenant.Project,
    id: parent.projectId,
  }));
