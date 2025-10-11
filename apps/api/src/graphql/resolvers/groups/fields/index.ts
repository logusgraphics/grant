import { groupPermissionsResolver as permissions } from './permissions.resolver';
import { groupTagsResolver as tags } from './tags.resolver';

export const groupResolver = {
  permissions,
  tags,
};
