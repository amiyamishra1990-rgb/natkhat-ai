# @natkhat-ai/config-typescript

Shared, strict TypeScript compiler configuration for Natkhat AI apps and
packages. One config source, per the Engineering Constitution's
Repository standard
(`docs/constitution/engineering/engineering-constitution.md`).

## Usage

In a consumer's `tsconfig.json`:

```jsonc
{
  "extends": "@natkhat-ai/config-typescript/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
  },
  "include": ["src"],
}
```

Add the package as a workspace dependency first:

```jsonc
// consumer package.json
{
  "devDependencies": {
    "@natkhat-ai/config-typescript": "workspace:*",
    "typescript": "^5.7.0",
  },
}
```

## What `base.json` sets

- `strict: true` plus `noUncheckedIndexedAccess` and `noImplicitOverride`
  for stronger-than-default type safety.
- `module`/`moduleResolution: NodeNext` — the current TypeScript-recommended
  setting for Node.js 20+ projects (ADR-0003).
- Declaration output, source maps, and consistent-casing/isolated-modules
  checks enabled for safe cross-package builds.
- Deliberately does **not** enable `noUnusedLocals`/`noUnusedParameters` —
  that's `@typescript-eslint/no-unused-vars` in
  [`@natkhat-ai/config-eslint`](../config-eslint/README.md), which supports
  `^_` ignore patterns `tsc` alone does not.

## Scope

Only `base.json` exists. Framework-specific variants (e.g. a NestJS
decorators tsconfig) are added when the consumer that needs them is
scaffolded (`docs/sprints/sprint-01.md`, Milestone 8+), not speculatively
here.
