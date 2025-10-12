import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/schema/**/*.graphql',
  documents: './src/operations/**/*.graphql',
  generates: {
    // Client-side types
    './src/generated/': {
      preset: 'client',
      config: {
        useIndexSignature: true,
        enumsAsTypes: false,
        scalars: {
          Date: 'Date',
          JSON: 'Record<string, unknown>',
        },
        withHooks: false,
        withComponent: false,
        withHOC: false,
      },
    },
    // Server-side resolver types (generic, no specific context)
    './src/generated/resolvers.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        useIndexSignature: true,
        enumsAsTypes: false,
        scalars: {
          Date: 'Date',
          JSON: 'Record<string, unknown>',
        },
      },
    },
  },
};

export default config;
