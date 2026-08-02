# @natkhat-ai/config-eslint

Shared ESLint standard (flat config, ESLint 9+) for Natkhat AI apps and
packages. One shared lint standard from day one, per
`docs/sprints/sprint-01.md`, §12.

## Usage

In a consumer's `eslint.config.js`:

```js
import baseConfig from '@natkhat-ai/config-eslint/base';

export default [
  ...baseConfig,
  {
    // consumer-specific overrides
  },
];
```

Add the package as a workspace dependency first:

```jsonc
// consumer package.json
{
  "devDependencies": {
    "@natkhat-ai/config-eslint": "workspace:*",
    "eslint": "^9.17.0",
  },
}
```

## What `base.js` sets

- `@eslint/js` recommended rules + `typescript-eslint` recommended rules
  (non-type-aware — works without a `parserOptions.project` reference, so
  it applies cleanly to any consumer without per-project tsconfig wiring).
- Node globals (`languageOptions.globals`).
- `@typescript-eslint/no-unused-vars` with `^_` ignore patterns (see
  [`@natkhat-ai/config-typescript`](../config-typescript/README.md) for
  why this lives here and not in `tsc`).
- `no-console` warns except `console.warn`/`console.error`.
- `eslint-config-prettier` last, to disable stylistic rules that would
  conflict with Prettier — ESLint checks code quality, Prettier owns
  formatting.
- Ignores build output (`dist/`, `build/`, `coverage/`, `.turbo/`).

This package lints itself with its own config (`npm run lint`) as a
standing validation that the shared config is loadable and functional.

## Scope

Only one shared config (`base.js`). Framework-specific variants are added
when a consumer that needs them exists, not speculatively here.
