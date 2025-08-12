import { ResolverFn } from '@/graphql/generated/types';
import { Context } from '@/graphql/types';
const getProjectById = async (projectId: string, organizationId: string, context: Context) => {
  const projectsResult = await context.providers.projects.getProjects({
    ids: [projectId],
    organizationId,
    limit: -1,
  });
  const project = projectsResult.projects[0];
  if (!project) {
    throw new Error(`Project with ID ${projectId} not found`);
  }
  return project;
};
export const createProjectFieldResolver =
  <T extends { projectId: string }>(): ResolverFn<any, T, Context, { organizationId: string }> =>
  async (parent, { organizationId }, context) => {
    return getProjectById(parent.projectId, organizationId, context);
  };
export const createOrganizationProjectFieldResolver =
  <T extends { projectId: string; organizationId: string }>(): ResolverFn<any, T, Context, any> =>
  async (parent, _args, context) => {
    return getProjectById(parent.projectId, parent.organizationId, context);
  };
