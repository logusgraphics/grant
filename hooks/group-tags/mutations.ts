import { gql } from '@apollo/client';

export const ADD_GROUP_TAG = gql`
  mutation AddGroupTag($input: AddGroupTagInput!) {
    addGroupTag(input: $input) {
      id
      groupId
      tagId
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_GROUP_TAG = gql`
  mutation RemoveGroupTag($input: RemoveGroupTagInput!) {
    removeGroupTag(input: $input) {
      id
      groupId
      tagId
      createdAt
      updatedAt
    }
  }
`;
