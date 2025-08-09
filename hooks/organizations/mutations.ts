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
    deleteOrganization(id: $id)
  }
`;

export const ADD_ORGANIZATION_ROLE = gql`
  mutation AddOrganizationRole($organizationId: ID!, $roleId: ID!) {
    addOrganizationRole(organizationId: $organizationId, roleId: $roleId) {
      id
      name
    }
  }
`;

export const REMOVE_ORGANIZATION_ROLE = gql`
  mutation RemoveOrganizationRole($organizationId: ID!, $roleId: ID!) {
    removeOrganizationRole(organizationId: $organizationId, roleId: $roleId)
  }
`;

export const ADD_ORGANIZATION_TAG = gql`
  mutation AddOrganizationTag($organizationId: ID!, $tagId: ID!) {
    addOrganizationTag(organizationId: $organizationId, tagId: $tagId) {
      id
      name
      color
    }
  }
`;

export const REMOVE_ORGANIZATION_TAG = gql`
  mutation RemoveOrganizationTag($organizationId: ID!, $tagId: ID!) {
    removeOrganizationTag(organizationId: $organizationId, tagId: $tagId)
  }
`;
