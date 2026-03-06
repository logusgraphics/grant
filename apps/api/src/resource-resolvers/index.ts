import { ResourceResolver } from '@/lib/authorization';

import {
  createProjectAppResourceResolver,
  createProjectResourceResolver,
  ProjectResourceData,
} from './project.resolver';
import { TagResourceData, createTagResourceResolver } from './tag.resolver';
import { UserResourceData, createUserResourceResolver } from './user.resolver';

export type ResourceResolvers = ReturnType<typeof createResourceResolvers>;

export interface ResourceResolversMap {
  project: ResourceResolver<ProjectResourceData>;
  projectApp: ResourceResolver<ProjectResourceData>;
  user: ResourceResolver<UserResourceData>;
  tag: ResourceResolver<TagResourceData>;
}

export function createResourceResolvers(): ResourceResolversMap {
  return {
    project: createProjectResourceResolver(),
    projectApp: createProjectAppResourceResolver(),
    user: createUserResourceResolver(),
    tag: createTagResourceResolver(),
  };
}
