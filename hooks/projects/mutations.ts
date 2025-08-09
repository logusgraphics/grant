import { gql } from '@apollo/client';

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      slug
      description
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      name
      slug
      description
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

export const ADD_PROJECT_ROLE = gql`
  mutation AddProjectRole($projectId: ID!, $roleId: ID!) {
    addProjectRole(projectId: $projectId, roleId: $roleId) {
      id
      name
    }
  }
`;

export const REMOVE_PROJECT_ROLE = gql`
  mutation RemoveProjectRole($projectId: ID!, $roleId: ID!) {
    removeProjectRole(projectId: $projectId, roleId: $roleId)
  }
`;

export const ADD_PROJECT_TAG = gql`
  mutation AddProjectTag($projectId: ID!, $tagId: ID!) {
    addProjectTag(projectId: $projectId, tagId: $tagId) {
      id
      name
      color
    }
  }
`;

export const REMOVE_PROJECT_TAG = gql`
  mutation RemoveProjectTag($projectId: ID!, $tagId: ID!) {
    removeProjectTag(projectId: $projectId, tagId: $tagId)
  }
`;
