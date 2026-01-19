import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
// Use @eslint/compat to make eslint-plugin-compat work with ESLint 9
import { fixupPluginRules } from '@eslint/compat';
import compatPlugin from 'eslint-plugin-compat';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Promise: 'readonly',
        Map: 'readonly',
        Set: 'readonly',
        WeakMap: 'readonly',
        WeakSet: 'readonly',
        Symbol: 'readonly',
        Proxy: 'readonly',
        Reflect: 'readonly',
        BigInt: 'readonly',
        ArrayBuffer: 'readonly',
        SharedArrayBuffer: 'readonly',
        Atomics: 'readonly',
        DataView: 'readonly',
        JSON: 'readonly',
        Math: 'readonly',
        Intl: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      // Use fixupPluginRules to make eslint-plugin-compat work with ESLint 9
      compat: fixupPluginRules(compatPlugin),
    },
    settings: {
      // Browser compatibility: eslint-plugin-compat automatically reads browserslist from package.json
      // Polyfills list tells the plugin which APIs are polyfilled (won't warn for these)
      polyfills: [
        // Core polyfills that should be available
        'Promise',
        'Array.from',
        'Object.assign',
        'String.prototype.includes',
        'Array.prototype.includes',
        'fetch',
        'IntersectionObserver',
        'ResizeObserver',
        'URL',
        'URLSearchParams',
      ],
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-unused-vars': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-undef': 'off', // TypeScript handles this
      // Browser compatibility rules - warns on unsupported browser APIs
      // Uses browserslist from package.json to determine which browsers to check
      'compat/compat': 'warn',
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/public/**',
    ],
  },
];
