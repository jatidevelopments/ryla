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
            reportsDirectory: '../../coverage/apps/web',
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
            exclude: [
                '**/*.spec.{ts,tsx}',
                '**/*.test.{ts,tsx}',
                '**/test/**',
                '**/node_modules/**',
                '**/.next/**',
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
            '@/': resolve(__dirname, './'),
            '@ryla/shared': resolve(__dirname, '../../libs/shared/src'),
            '@ryla/data': resolve(__dirname, '../../libs/data/src'),
            '@ryla/business': resolve(__dirname, '../../libs/business/src'),
            '@ryla/email': resolve(__dirname, '../../libs/email/src'),
            '@ryla/analytics': resolve(__dirname, '../../libs/analytics/src'),
            '@ryla/trpc': resolve(__dirname, '../../libs/trpc/src'),
            '@ryla/payments': resolve(__dirname, '../../libs/payments/src'),
            '@ryla/ui': resolve(__dirname, '../../libs/ui/src'),
        },
    },
});
