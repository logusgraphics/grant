import { gql } from '@apollo/client';

export const ADD_PROJECT_PERMISSION = gql`
  mutation AddProjectPermission($input: AddProjectPermissionInput!) {
    addProjectPermission(input: $input) {
      id
      projectId
      permissionId
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_PROJECT_PERMISSION = gql`
  mutation RemoveProjectPermission($input: RemoveProjectPermissionInput!) {
    removeProjectPermission(input: $input) {
      id
      projectId
      permissionId
      createdAt
      updatedAt
    }
  }
`;
