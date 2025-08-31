import { ProjectResolvers } from '@/graphql/generated/types';
import { getDirectFieldSelection } from '@/graphql/lib/fieldSelection';

export const projectGroupsResolver: ProjectResolvers['groups'] = async (
  parent,
  _args,
  context,
  info
) => {
  const projectId = parent.id;
  const requestedFields = info ? getDirectFieldSelection(info) : undefined;

  return await context.controllers.projects.getProjectGroups(projectId, requestedFields);
};
