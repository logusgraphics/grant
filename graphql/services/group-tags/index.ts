import { IGroupTagRepository, IGroupRepository, ITagRepository } from '@/graphql/repositories';
import { AuthenticatedUser } from '@/graphql/types';

import { GroupTagService } from './service';

export * from './interface';
export * from './service';
export * from './schemas';

export function createGroupTagService(
  groupTagRepository: IGroupTagRepository,
  groupRepository: IGroupRepository,
  tagRepository: ITagRepository,
  user: AuthenticatedUser | null
) {
  return new GroupTagService(groupTagRepository, groupRepository, tagRepository, user);
}
