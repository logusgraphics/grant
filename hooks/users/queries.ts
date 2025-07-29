import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers($page: Int!, $limit: Int!, $sort: UserSortInput, $search: String) {
    users(page: $page, limit: $limit, sort: $sort, search: $search) {
      users {
        id
        name
        email
        createdAt
        updatedAt
        roles {
          id
          name
          tags {
            id
            color
          }
        }
        tags {
          id
          color
        }
      }
      totalCount
      hasNextPage
    }
  }
`;
