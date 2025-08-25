import { ResolverFn, Scope } from '@/graphql/generated/types';
import { Tenant } from '@/graphql/generated/types';
import { getScopedTagIds } from '@/graphql/lib/scopeFiltering';
import { Context } from '@/graphql/types';

export const createTagFieldResolver =
  <T extends { tagId: string }>(
    scopeFactory: (parent: T) => Scope
  ): ResolverFn<any, T, Context, any> =>
  async (parent, _args, context) => {
    const scope = scopeFactory(parent);
    const scopedTagIds = await getScopedTagIds({ scope, context });

    if (!scopedTagIds.includes(parent.tagId)) {
      throw new Error(`Tag with ID ${parent.tagId} is not accessible in the current scope`);
    }

    const tagsResult = await context.services.tags.getTags({
      ids: [parent.tagId],
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
