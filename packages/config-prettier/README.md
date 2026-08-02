# @natkhat-ai/config-prettier

Shared Prettier formatting standard for Natkhat AI apps and packages. One
shared formatting standard from day one, per `docs/sprints/sprint-01.md`,
§12.

## Usage

In a consumer's `package.json`:

```jsonc
{
  "prettier": "@natkhat-ai/config-prettier",
  "devDependencies": {
    "@natkhat-ai/config-prettier": "workspace:*",
    "prettier": "^3.4.0",
  },
}
```

Or reference it from a `.prettierrc.json`:

```json
"@natkhat-ai/config-prettier"
```

## What `index.json` sets

Matches the repository root `.editorconfig` (2-space indent, LF line
endings): `semi: true`, `singleQuote: true`, `trailingComma: "all"`,
`printWidth: 100`, `tabWidth: 2`, `endOfLine: "lf"`, `arrowParens:
"always"`, `bracketSpacing: true`.

This package validates its own JSON formatting against its own config
(`npm run format:check`) as a standing check that the shared config is
loadable and functional.

## Scope

Only one shared config (`index.json`). No per-consumer overrides are
defined here — a consumer that needs an exception adds it locally.
