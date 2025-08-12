import { gql } from '@apollo/client';

export const ADD_GROUP_PERMISSION = gql`
  mutation AddGroupPermission($input: AddGroupPermissionInput!) {
    addGroupPermission(input: $input) {
      id
      groupId
      permissionId
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_GROUP_PERMISSION = gql`
  mutation RemoveGroupPermission($input: RemoveGroupPermissionInput!) {
    removeGroupPermission(input: $input) {
      id
      groupId
      permissionId
      createdAt
      updatedAt
    }
  }
`;
