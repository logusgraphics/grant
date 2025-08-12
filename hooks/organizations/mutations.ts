import { gql } from '@apollo/client';

export const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($input: CreateOrganizationInput!) {
    createOrganization(input: $input) {
      id
      name
      slug
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_ORGANIZATION = gql`
  mutation UpdateOrganization($id: ID!, $input: UpdateOrganizationInput!) {
    updateOrganization(id: $id, input: $input) {
      id
      name
      slug
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_ORGANIZATION = gql`
  mutation DeleteOrganization($id: ID!) {
    deleteOrganization(id: $id) {
      id
      name
      slug
      createdAt
      updatedAt
    }
  }
`;
