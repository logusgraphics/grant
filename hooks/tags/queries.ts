import { gql } from '@apollo/client';

export const GET_TAGS = gql`
  query GetTags($page: Int!, $limit: Int!, $sort: TagSortInput, $search: String) {
    tags(page: $page, limit: $limit, sort: $sort, search: $search) {
      tags {
        id
        name
        color
        createdAt
        updatedAt
      }
      totalCount
      hasNextPage
    }
  }
`;

export const GET_TAGS_BY_IDS = gql`
  query GetTagsByIds($ids: [ID!]!) {
    tags(ids: $ids) {
      tags {
        id
        name
        color
        createdAt
        updatedAt
      }
      totalCount
      hasNextPage
    }
  }
`;
