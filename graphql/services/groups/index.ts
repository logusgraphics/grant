import { IGroupRepository } from '@/graphql/repositories/groups/interface';
import { AuthenticatedUser } from '@/graphql/types';

import { GroupService } from './service';

export { GroupService } from './service';
export type { IGroupService } from './interface';
export * from './schemas';

export function createGroupService(
  groupRepository: IGroupRepository,
  user: AuthenticatedUser | null
) {
  return new GroupService(groupRepository, user);
}
