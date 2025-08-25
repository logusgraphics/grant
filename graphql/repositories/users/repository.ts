import {
  QueryUsersArgs,
  MutationCreateUserArgs,
  MutationUpdateUserArgs,
  MutationDeleteUserArgs,
  User,
  UserPage,
} from '@/graphql/generated/types';
import {
  EntityRepository,
  BaseQueryArgs,
  BaseCreateArgs,
  BaseUpdateArgs,
  BaseDeleteArgs,
} from '@/graphql/repositories/common';

import { UserModel, users } from './schema';

export class UserRepository extends EntityRepository<UserModel, User> {
  protected table = users;
  protected searchFields: Array<keyof UserModel> = ['name', 'email'];
  protected defaultSortField: keyof UserModel = 'createdAt';

  public async getUsers(
    params: Omit<QueryUsersArgs, 'scope'> & { requestedFields?: Array<keyof UserModel> }
  ): Promise<UserPage> {
    const baseParams: BaseQueryArgs<UserModel> = {
      ids: params.ids || undefined,
      page: params.page || undefined,
      limit: params.limit || undefined,
      search: params.search || undefined,
      sort: params.sort
        ? {
            field: params.sort.field as keyof UserModel,
            order: params.sort.order,
          }
        : undefined,
      requestedFields: params.requestedFields as Array<keyof UserModel> | undefined,
    };

    const result = await this.query(baseParams);

    return {
      users: result.items,
      totalCount: result.totalCount,
      hasNextPage: result.hasNextPage,
    };
  }

  public async createUser(params: MutationCreateUserArgs): Promise<User> {
    const baseParams: BaseCreateArgs = {
      name: params.input.name,
      email: params.input.email,
    };

    return this.create(baseParams);
  }

  public async updateUser(params: MutationUpdateUserArgs): Promise<User> {
    const baseParams: BaseUpdateArgs = {
      id: params.id,
      input: {
        name: params.input.name,
        email: params.input.email,
      },
    };

    return this.update(baseParams);
  }

  public async softDeleteUser(params: MutationDeleteUserArgs): Promise<User> {
    const baseParams: BaseDeleteArgs = {
      id: params.id,
    };

    return this.softDelete(baseParams);
  }

  public async hardDeleteUser(params: MutationDeleteUserArgs): Promise<User> {
    const baseParams: BaseDeleteArgs = {
      id: params.id,
    };

    return this.hardDelete(baseParams);
  }
}
