import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.tsx'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    testTimeout: 30000,
    coverage: {
      reportsDirectory: '../../coverage/apps/landing',
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
      exclude: [
        '**/*.spec.{ts,tsx}',
        '**/*.test.{ts,tsx}',
        '**/test/**',
        '**/node_modules/**',
        '**/.next/**',
        '**/index.ts', // Barrel exports (re-exports only, not testable)
        '**/cdn.ts', // Re-export file (no executable code)
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@/': resolve(__dirname, './'),
      '@ryla/shared': resolve(__dirname, '../../libs/shared/src'),
      '@ryla/business': resolve(__dirname, '../../libs/business/src'),
      '@ryla/ui': resolve(__dirname, '../../libs/ui/src'),
      '@ryla/analytics': resolve(__dirname, '../../libs/analytics/src'),
    },
  },
});
