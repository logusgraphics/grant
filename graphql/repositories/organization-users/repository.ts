import {
  MutationAddOrganizationUserArgs,
  MutationRemoveOrganizationUserArgs,
  OrganizationUser,
} from '@/graphql/generated/types';
import {
  PivotRepository,
  BasePivotQueryArgs,
  BasePivotAddArgs,
  BasePivotRemoveArgs,
} from '@/graphql/repositories/common';

import { IOrganizationUserRepository } from './interface';
import { organizationUsers, OrganizationUserModel } from './schema';

export class OrganizationUserRepository
  extends PivotRepository<OrganizationUserModel, OrganizationUser>
  implements IOrganizationUserRepository
{
  protected table = organizationUsers;
  protected parentIdField: keyof OrganizationUserModel = 'organizationId';
  protected relatedIdField: keyof OrganizationUserModel = 'userId';

  protected toEntity(dbOrganizationUser: OrganizationUserModel): OrganizationUser {
    return {
      id: dbOrganizationUser.id,
      organizationId: dbOrganizationUser.organizationId,
      userId: dbOrganizationUser.userId,
      createdAt: dbOrganizationUser.createdAt,
      updatedAt: dbOrganizationUser.updatedAt,
      deletedAt: dbOrganizationUser.deletedAt,
    };
  }

  public async getOrganizationUsers(params: {
    organizationId: string;
  }): Promise<OrganizationUser[]> {
    const baseParams: BasePivotQueryArgs = {
      parentId: params.organizationId,
    };

    return this.query(baseParams);
  }

  public async addOrganizationUser(
    params: MutationAddOrganizationUserArgs
  ): Promise<OrganizationUser> {
    const baseParams: BasePivotAddArgs = {
      parentId: params.input.organizationId,
      relatedId: params.input.userId,
    };

    const organizationUser = await this.add(baseParams);

    return organizationUser;
  }

  public async softDeleteOrganizationUser(
    params: MutationRemoveOrganizationUserArgs
  ): Promise<OrganizationUser> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: params.input.organizationId,
      relatedId: params.input.userId,
    };

    const organizationUser = await this.softDelete(baseParams);

    return organizationUser;
  }

  public async hardDeleteOrganizationUser(
    params: MutationRemoveOrganizationUserArgs
  ): Promise<OrganizationUser> {
    const baseParams: BasePivotRemoveArgs = {
      parentId: params.input.organizationId,
      relatedId: params.input.userId,
    };

    const organizationUser = await this.hardDelete(baseParams);

    return organizationUser;
  }
}
