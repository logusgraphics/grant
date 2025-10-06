import { gql } from '@apollo/client';

export const CHECK_USERNAME = gql`
  query CheckUsername($username: String!) {
    checkUsername(username: $username) {
      available
      username
    }
  }
`;
