import { resourcePermissionsResolver as permissions } from './permissions.resolver';
import { resourceTagsResolver as tags } from './tags.resolver';

export const resourceResolver = {
  permissions,
  tags,
};
