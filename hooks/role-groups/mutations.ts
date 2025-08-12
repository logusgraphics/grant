import { gql } from '@apollo/client';

export const ADD_ROLE_GROUP = gql`
  mutation AddRoleGroup($input: AddRoleGroupInput!) {
    addRoleGroup(input: $input) {
      id
      groupId
      roleId
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_ROLE_GROUP = gql`
  mutation RemoveRoleGroup($input: RemoveRoleGroupInput!) {
    removeRoleGroup(input: $input) {
      id
      groupId
      roleId
      createdAt
      updatedAt
    }
  }
`;
