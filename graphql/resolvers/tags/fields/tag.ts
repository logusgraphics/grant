import { GraphQLResolveInfo } from 'graphql';

export const Tag = {
  id: (parent: any) => parent.id,
  name: (parent: any) => parent.name,
  color: (parent: any) => parent.color,
  createdAt: (parent: any) => parent.createdAt,
  updatedAt: (parent: any) => parent.updatedAt,
};
