import { ProjectTagResolvers, ProjectTag } from '@/graphql/generated/types';
import { createProjectFieldResolver } from '@/graphql/resolvers/common';
export const projectTagProjectResolver: ProjectTagResolvers['project'] =
  createProjectFieldResolver<ProjectTag>();
