import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers($page: Int!, $limit: Int!) {
    users(page: $page, limit: $limit) {
      users {
        id
        name
        email
      }
      totalCount
      hasNextPage
    }
  }
`;
