import { GraphQLScalarType, Kind } from 'graphql';

export const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type that accepts both Date objects and ISO strings',

  // Serialize: Return Date object or convert string to Date
  serialize(value: unknown): Date {
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'string') {
      return new Date(value);
    }
    throw new Error('GraphQL Date Scalar serializer expected a `Date` object or ISO string');
  },

  // ParseValue: Convert string from GraphQL variables to Date object
  parseValue(value: unknown): Date {
    if (typeof value === 'string') {
      return new Date(value);
    }
    if (value instanceof Date) {
      return value;
    }
    throw new Error('GraphQL Date Scalar parser expected a `string` or `Date`');
  },

  // ParseL teral: Convert AST literal to Date object
  parseLiteral(ast): Date | null {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});
