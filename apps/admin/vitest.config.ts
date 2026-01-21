import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
    setupFiles: ['./lib/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: '../../coverage/apps/admin',
      include: ['lib/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
      exclude: [
        '**/*.spec.{ts,tsx}',
        '**/*.test.{ts,tsx}',
        '**/test/**',
        '**/node_modules/**',
        '**/.next/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@ryla/shared': path.resolve(__dirname, '../../libs/shared/src'),
      '@ryla/data': path.resolve(__dirname, '../../libs/data/src'),
      '@ryla/business': path.resolve(__dirname, '../../libs/business/src'),
      '@ryla/ui': path.resolve(__dirname, '../../libs/ui/src'),
      '@ryla/analytics': path.resolve(__dirname, '../../libs/analytics/src'),
    },
  },
});
