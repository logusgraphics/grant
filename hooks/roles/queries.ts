import { gql } from '@apollo/client';

export const GET_ROLES = gql`
  query GetRoles($page: Int!, $limit: Int!, $sort: RoleSortInput, $search: String, $ids: [ID!]) {
    roles(page: $page, limit: $limit, sort: $sort, search: $search, ids: $ids) {
      roles {
        id
        name
        description
        groups {
          id
          name
        }
      }
      totalCount
      hasNextPage
    }
  }
`;
