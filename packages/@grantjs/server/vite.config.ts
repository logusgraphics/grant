import { resolve } from 'path';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  esbuild: {
    // Required for NestJS parameter decorators (e.g. @Inject) when bundling nest entry
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    },
  },
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/__tests__/**'],
      tsconfigPath: './tsconfig.build.json',
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        express: resolve(__dirname, 'src/express/index.ts'),
        fastify: resolve(__dirname, 'src/fastify/index.ts'),
        next: resolve(__dirname, 'src/next/index.ts'),
        nest: resolve(__dirname, 'src/nest/index.ts'),
      },
      name: 'GrantServer',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'mjs' : 'cjs';
        return `${entryName}.${ext}`;
      },
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      external: [
        'express',
        'fastify',
        'next/server',
        '@nestjs/common',
        '@nestjs/core',
        '@grantjs/schema',
      ],
      output: {
        // Global vars for UMD build
        globals: {
          express: 'Express',
          fastify: 'Fastify',
          'next/server': 'NextServer',
          '@nestjs/common': 'nestjsCommon',
          '@nestjs/core': 'nestjsCore',
          '@grantjs/schema': 'GrantSchema',
        },
        // preserveModules: false bundles each entry into a single file
        // This is fine for tree-shaking because:
        // 1. Each framework has its own entry point (express, fastify, nestjs, etc.)
        // 2. Users only import what they need: '@grantjs/server/express'
        // 3. Bundlers can eliminate unused exports from the entry file
        // For even better tree-shaking, set preserveModules: true, but that creates many files
        preserveModules: false,
      },
    },
    sourcemap: true,
    minify: false, // Keep readable for debugging
    target: 'es2020',
    outDir: 'dist',
    emptyDirBeforeWrite: true,
  },
  resolve: {
    alias: {
      '@grantjs/schema': resolve(__dirname, '../schema/src/index.ts'),
    },
  },
  // Vitest configuration
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.{test,spec}.ts', 'src/__tests__/**'],
    },
  },
});
