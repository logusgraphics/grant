import { gql } from '@apollo/client';

export const ADD_ROLE_TAG = gql`
  mutation AddRoleTag($input: AddRoleTagInput!) {
    addRoleTag(input: $input) {
      id
      roleId
      tagId
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_ROLE_TAG = gql`
  mutation RemoveRoleTag($input: RemoveRoleTagInput!) {
    removeRoleTag(input: $input) {
      id
      roleId
      tagId
      createdAt
      updatedAt
    }
  }
`;
