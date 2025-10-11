import { roleGroupsResolver as groups } from './groups.resolver';
import { roleTagsResolver as tags } from './tags.resolver';

export const roleResolver = {
  tags,
  groups,
};
