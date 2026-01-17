import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

const rootDir = resolve(__dirname, '..');

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['scripts/setup/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
    exclude: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
    reporters: ['default'],
    testTimeout: 10000,
    root: rootDir,
    coverage: {
      reportsDirectory: 'coverage/scripts',
      provider: 'v8',
      include: ['scripts/setup/**/*.ts'],
      exclude: ['scripts/setup/**/*.spec.ts', 'scripts/setup/**/*.test.ts', 'scripts/setup/__fixtures__/**', 'scripts/setup/__test-utils__/**'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(rootDir, 'scripts'),
    },
  },
});
