import {
  QueryRoleTagsArgs,
  MutationAddRoleTagArgs,
  MutationRemoveRoleTagArgs,
  RoleTag,
} from '@/graphql/generated/types';

export interface IRoleTagRepository {
  getRoleTags(params: Omit<QueryRoleTagsArgs, 'scope'>): Promise<RoleTag[]>;
  addRoleTag(params: MutationAddRoleTagArgs): Promise<RoleTag>;
  softDeleteRoleTag(params: MutationRemoveRoleTagArgs): Promise<RoleTag>;
  hardDeleteRoleTag(params: MutationRemoveRoleTagArgs): Promise<RoleTag>;
}
