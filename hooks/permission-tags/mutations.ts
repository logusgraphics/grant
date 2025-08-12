import { gql } from '@apollo/client';

export const ADD_PERMISSION_TAG = gql`
  mutation AddPermissionTag($input: AddPermissionTagInput!) {
    addPermissionTag(input: $input) {
      id
      permissionId
      tagId
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_PERMISSION_TAG = gql`
  mutation RemovePermissionTag($input: RemovePermissionTagInput!) {
    removePermissionTag(input: $input) {
      id
      permissionId
      tagId
      createdAt
      updatedAt
    }
  }
`;
