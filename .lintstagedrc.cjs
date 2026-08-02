const path = require('node:path');

// ESLint v9 flat config resolves eslint.config.* relative to process.cwd(),
// not per-file — so backend files must be linted with cwd set to
// apps/backend (via `pnpm --filter backend exec`) rather than from the
// repo root.
const backendDir = path.join(__dirname, 'apps', 'backend');

module.exports = {
  'apps/backend/**/*.{ts,js}': (filenames) => {
    const relative = filenames.map((f) => JSON.stringify(path.relative(backendDir, f)));
    return `pnpm --filter backend exec eslint --fix ${relative.join(' ')}`;
  },
  '**/*.{ts,tsx,js,jsx,json,md,mdx,yml,yaml}': ['prettier --write'],
};
