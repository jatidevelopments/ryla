import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    testTimeout: 10000,
    coverage: {
      reportsDirectory: '../../coverage/libs/business',
      provider: 'v8',
    },
  },
  resolve: {
    alias: {
      '@ryla/shared': resolve(__dirname, '../shared/src'),
      '@ryla/data': resolve(__dirname, '../data/src'),
    },
  },
});
