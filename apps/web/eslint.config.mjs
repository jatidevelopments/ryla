import baseConfig from '../../eslint.config.mjs';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import nextConfig from 'eslint-config-next';

export default [
  ...baseConfig,
  {
    files: ['**/*.tsx', '**/*.jsx'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Next.js doesn't require React import
      'react/prop-types': 'off', // Using TypeScript for prop validation
    },
  },
  ...nextConfig,
];

