import { gql } from '@apollo/client';

export const ADD_ORGANIZATION_PERMISSION = gql`
  mutation AddOrganizationPermission($input: AddOrganizationPermissionInput!) {
    addOrganizationPermission(input: $input) {
      id
      organizationId
      permissionId
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_ORGANIZATION_PERMISSION = gql`
  mutation RemoveOrganizationPermission($input: RemoveOrganizationPermissionInput!) {
    removeOrganizationPermission(input: $input) {
      id
      organizationId
      permissionId
      createdAt
      updatedAt
    }
  }
`;
