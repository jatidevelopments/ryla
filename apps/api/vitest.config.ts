import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        reporters: ['default'],
        coverage: {
            reportsDirectory: '../../coverage/apps/api',
            provider: 'v8',
        },
    },
    resolve: {
        alias: {
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
