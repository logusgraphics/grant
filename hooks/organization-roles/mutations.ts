import { gql } from '@apollo/client';

export const ADD_ORGANIZATION_ROLE = gql`
  mutation AddOrganizationRole($input: AddOrganizationRoleInput!) {
    addOrganizationRole(input: $input) {
      id
      organizationId
      roleId
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_ORGANIZATION_ROLE = gql`
  mutation RemoveOrganizationRole($input: RemoveOrganizationRoleInput!) {
    removeOrganizationRole(input: $input) {
      id
      organizationId
      roleId
      createdAt
      updatedAt
    }
  }
`;
