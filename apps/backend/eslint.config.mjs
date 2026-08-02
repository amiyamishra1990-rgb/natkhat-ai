// @ts-check
import baseConfig from '@natkhat-ai/config-eslint/base';
import globals from 'globals';

export default [
  {
    ignores: ['eslint.config.mjs', 'dist/**'],
  },
  ...baseConfig,
  {
    files: ['test/**/*.ts', '**/*.spec.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];
