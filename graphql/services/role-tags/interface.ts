import {
  QueryRoleTagsArgs,
  MutationAddRoleTagArgs,
  MutationRemoveRoleTagArgs,
  RoleTag,
} from '@/graphql/generated/types';

export interface IRoleTagService {
  getRoleTags(params: Omit<QueryRoleTagsArgs, 'scope'>): Promise<RoleTag[]>;
  addRoleTag(params: MutationAddRoleTagArgs): Promise<RoleTag>;
  removeRoleTag(params: MutationRemoveRoleTagArgs & { hardDelete?: boolean }): Promise<RoleTag>;
}
