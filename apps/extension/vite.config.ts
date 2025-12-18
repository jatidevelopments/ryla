/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve' || mode === 'development';

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/extension',

    server: {
      port: 4300,
      host: 'localhost',
    },

    preview: {
      port: 4301,
      host: 'localhost',
    },

    plugins: [react()],

    build: {
      outDir: '../../dist/apps/extension',
      emptyOutDir: !isDev,
      reportCompressedSize: !isDev,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'src/popup.tsx'),
          background: resolve(__dirname, 'src/background.ts'),
          contentScript: resolve(__dirname, 'src/content-script.tsx'),
        },
        output: {
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'background') {
              return 'background.js';
            }
            if (chunkInfo.name === 'contentScript') {
              return 'content-script.js';
            }
            return 'assets/[name].js';
          },
          chunkFileNames: 'assets/[name].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'popup.html') {
              return 'popup.html';
            }
            if (assetInfo.name === 'manifest.json') {
              return 'manifest.json';
            }
            if (assetInfo.name?.endsWith('.ico')) {
              return '[name][extname]';
            }
            return 'assets/[name].[ext]';
          },
          // Prevent code-splitting for extension scripts
          manualChunks: (id) => {
            if (
              id.includes('background.ts') ||
              id.includes('content-script')
            ) {
              return null;
            }
          },
        },
      },
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },

    publicDir: 'public',
  };
});
