import {
  QueryOrganizationTagsArgs,
  MutationAddOrganizationTagArgs,
  MutationRemoveOrganizationTagArgs,
  OrganizationTag,
} from '@/graphql/generated/types';
import { PivotRepository } from '@/graphql/repositories/common';

import { OrganizationTagModel, organizationTags } from './schema';

export class OrganizationTagRepository extends PivotRepository<
  OrganizationTagModel,
  OrganizationTag
> {
  protected table = organizationTags;
  protected parentIdField: keyof OrganizationTagModel = 'organizationId';
  protected relatedIdField: keyof OrganizationTagModel = 'tagId';

  protected toEntity(dbPivot: OrganizationTagModel): OrganizationTag {
    return {
      id: dbPivot.id,
      organizationId: dbPivot.organizationId,
      tagId: dbPivot.tagId,
      createdAt: dbPivot.createdAt,
      updatedAt: dbPivot.updatedAt,
      deletedAt: dbPivot.deletedAt,
    };
  }

  public async getOrganizationTags(params: QueryOrganizationTagsArgs): Promise<OrganizationTag[]> {
    return this.query({ parentId: params.organizationId });
  }

  public async addOrganizationTag(
    params: MutationAddOrganizationTagArgs
  ): Promise<OrganizationTag> {
    return this.add({
      parentId: params.input.organizationId,
      relatedId: params.input.tagId,
    });
  }

  public async softDeleteOrganizationTag(
    params: MutationRemoveOrganizationTagArgs
  ): Promise<OrganizationTag> {
    return this.softDelete({
      parentId: params.input.organizationId,
      relatedId: params.input.tagId,
    });
  }

  public async hardDeleteOrganizationTag(
    params: MutationRemoveOrganizationTagArgs
  ): Promise<OrganizationTag> {
    return this.hardDelete({
      parentId: params.input.organizationId,
      relatedId: params.input.tagId,
    });
  }
}
