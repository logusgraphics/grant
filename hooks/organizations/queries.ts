import { gql } from '@apollo/client';

export const GET_ORGANIZATIONS = gql`
  query GetOrganizations(
    $page: Int
    $limit: Int
    $sort: OrganizationSortInput
    $search: String
    $ids: [ID!]
    $tagIds: [ID!]
  ) {
    organizations(
      page: $page
      limit: $limit
      sort: $sort
      search: $search
      ids: $ids
      tagIds: $tagIds
    ) {
      organizations {
        id
        name
        slug
        createdAt
        updatedAt
        tags {
          id
          name
          color
        }
      }
      totalCount
      hasNextPage
    }
  }
`;
