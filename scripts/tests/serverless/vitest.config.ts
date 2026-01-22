import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: __dirname,
    include: ['__tests__/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['**/*.ts'],
      exclude: [
        '__tests__/**',
        '__test-utils__/**',
        'fixtures/**',
        'vitest.config.ts',
        'cli.ts',
      ],
    },
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
});
