import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './graphql/schema/root.graphql',
  generates: {
    './graphql/generated/types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        useIndexSignature: true,
        contextType: '@/graphql/types#Context',
      },
    },
  },
};

export default config;
