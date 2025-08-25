import { ResolverFn, Scope } from '@/graphql/generated/types';
import { Tenant } from '@/graphql/generated/types';
import { getScopedUserIds } from '@/graphql/lib/scopeFiltering';
import { Context } from '@/graphql/types';

export const createUserFieldResolver =
  <T extends { userId: string }>(
    scopeFactory: (parent: T) => Scope
  ): ResolverFn<any, T, Context, any> =>
  async (parent, _args, context) => {
    const scope = scopeFactory(parent);
    const scopedUserIds = await getScopedUserIds({ scope, context });

    if (!scopedUserIds.includes(parent.userId)) {
      throw new Error(`User with ID ${parent.userId} is not accessible in the current scope`);
    }

    const usersResult = await context.services.users.getUsers({
      ids: [parent.userId],
      limit: -1,
    });

    const user = usersResult.users[0];

    if (!user) {
      throw new Error(`User with ID ${parent.userId} not found`);
    }

    return user;
  };

export const createOrganizationUserFieldResolver = <
  T extends { userId: string; organizationId: string },
>() =>
  createUserFieldResolver<T>((parent) => ({
    tenant: Tenant.Organization,
    id: parent.organizationId,
  }));

export const createProjectUserFieldResolver = <T extends { userId: string; projectId: string }>() =>
  createUserFieldResolver<T>((parent) => ({
    tenant: Tenant.Project,
    id: parent.projectId,
  }));
