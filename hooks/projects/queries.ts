import { gql } from '@apollo/client';

export const GET_PROJECTS = gql`
  query GetProjects(
    $organizationId: ID!
    $page: Int!
    $limit: Int!
    $sort: ProjectSortInput
    $search: String
    $ids: [ID!]
  ) {
    projects(
      organizationId: $organizationId
      page: $page
      limit: $limit
      sort: $sort
      search: $search
      ids: $ids
    ) {
      projects {
        id
        name
        slug
        description
        createdAt
        updatedAt
      }
      totalCount
      hasNextPage
    }
  }
`;
