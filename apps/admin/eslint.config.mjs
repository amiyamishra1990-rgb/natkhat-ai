// @ts-check
import { defineConfig, globalIgnores } from 'eslint/config';
import baseConfig from '@natkhat-ai/config-eslint/base';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// Shared base first (@natkhat-ai/config-eslint), same pattern
// apps/backend/eslint.config.mjs uses, with Next.js's own
// React/App-Router rule sets layered on top — both are flat-config
// arrays, so they compose directly.
export default defineConfig([
  ...baseConfig,
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
