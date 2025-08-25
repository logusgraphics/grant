import { ITagRepository } from '@/graphql/repositories/tags/interface';
import { AuthenticatedUser } from '@/graphql/types';

import { TagService } from './service';

export { TagService } from './service';
export type { ITagService } from './interface';
export * from './schemas';

export function createTagService(tagRepository: ITagRepository, user: AuthenticatedUser | null) {
  return new TagService(tagRepository, user);
}
