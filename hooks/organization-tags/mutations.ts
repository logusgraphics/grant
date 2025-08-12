import { gql } from '@apollo/client';

export const ADD_ORGANIZATION_TAG = gql`
  mutation AddOrganizationTag($input: AddOrganizationTagInput!) {
    addOrganizationTag(input: $input) {
      id
      organizationId
      tagId
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_ORGANIZATION_TAG = gql`
  mutation RemoveOrganizationTag($input: RemoveOrganizationTagInput!) {
    removeOrganizationTag(input: $input) {
      id
      organizationId
      tagId
      createdAt
      updatedAt
    }
  }
`;
