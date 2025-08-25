import {
  QueryProjectsArgs,
  MutationCreateProjectArgs,
  MutationUpdateProjectArgs,
  MutationDeleteProjectArgs,
  Project,
  ProjectPage,
} from '@/graphql/generated/types';

export interface IProjectRepository {
  getProjects(
    params: Omit<QueryProjectsArgs, 'organizationId'> & { requestedFields?: string[] }
  ): Promise<ProjectPage>;
  getProjectById(id: string): Promise<Project | null>;
  createProject(params: MutationCreateProjectArgs): Promise<Project>;
  updateProject(params: MutationUpdateProjectArgs): Promise<Project>;
  softDeleteProject(params: MutationDeleteProjectArgs): Promise<Project>;
  hardDeleteProject(params: MutationDeleteProjectArgs): Promise<Project>;
}
