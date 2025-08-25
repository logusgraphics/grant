import {
  QueryProjectsArgs,
  MutationCreateProjectArgs,
  MutationUpdateProjectArgs,
  MutationDeleteProjectArgs,
  Project,
  ProjectPage,
} from '@/graphql/generated/types';

export interface IProjectService {
  getProjects(
    params: Omit<QueryProjectsArgs, 'scope'> & { requestedFields?: string[] }
  ): Promise<ProjectPage>;
  createProject(params: MutationCreateProjectArgs): Promise<Project>;
  updateProject(params: MutationUpdateProjectArgs): Promise<Project>;
  deleteProject(params: MutationDeleteProjectArgs & { hardDelete?: boolean }): Promise<Project>;
}
