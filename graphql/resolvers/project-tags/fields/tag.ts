import { ProjectTagResolvers, ProjectTag } from '@/graphql/generated/types';
import { createProjectTagFieldResolver } from '@/graphql/resolvers/common';
export const projectTagTagResolver: ProjectTagResolvers['tag'] =
  createProjectTagFieldResolver<ProjectTag>();
