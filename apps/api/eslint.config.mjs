import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.js'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    // Allow all console methods in logger services
    files: [
      '**/logger/**/*.ts',
      '**/logger/**/*.js',
      '**/*logger*.ts',
      '**/*logger*.js',
    ],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Allow console in main entry points and seed scripts
    files: ['**/main.ts', '**/seed*.ts', '**/seed*.js'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Allow CommonJS in .js files (for database schemas)
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        require: 'readonly',
        exports: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off', // CommonJS uses global require/exports
    },
  },
];
