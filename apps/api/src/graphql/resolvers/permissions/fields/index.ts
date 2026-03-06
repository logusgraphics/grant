import { permissionResourceResolver as resource } from './resource.resolver';
import { permissionTagsResolver as tags } from './tags.resolver';

export const permissionResolver = {
  resource,
  tags,
};
