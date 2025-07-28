import { gql } from '@apollo/client';

export const GET_GROUPS = gql`
  query GetGroups($page: Int!, $limit: Int!, $sort: GroupSortInput, $search: String, $ids: [ID!]) {
    groups(page: $page, limit: $limit, sort: $sort, search: $search, ids: $ids) {
      groups {
        id
        name
        description
        createdAt
        updatedAt
        permissions {
          id
          name
          action
          description
        }
      }
      totalCount
      hasNextPage
    }
  }
`;
