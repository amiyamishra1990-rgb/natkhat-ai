// Black-box test for check-env.ts (Sprint 03, Milestone 13; founder
// decision E.5): check-env.ts is not refactored into importable
// functions and scripts/ is not turned into a workspace package, so
// this exercises it as a subprocess via the existing tsx tooling —
// the same way `pnpm run check-env` already invokes it — using only
// node:assert, no Jest/Vitest. Run with: tsx scripts/check-env.spec.ts
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const VALID_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/natkhat_dev';

function runCheckEnv(env: NodeJS.ProcessEnv) {
  // A single command string (not a separate args array) avoids
  // Node's shell:true + argv-array deprecation warning; every part of
  // the command here is a static literal, never user input.
  return spawnSync('pnpm exec tsx scripts/check-env.ts', {
    cwd: repoRoot,
    env,
    encoding: 'utf8',
    shell: true,
  });
}

let failures = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`not ok - ${name}`);
    console.error(error instanceof Error ? error.message : error);
  }
}

test('valid environment exits successfully', () => {
  const result = runCheckEnv({
    ...process.env,
    DATABASE_URL: VALID_DATABASE_URL,
  });
  assert.equal(result.status, 0, `expected exit 0, got ${result.status}`);
  assert.match(result.stdout, /Environment OK\./);
});

test('missing DATABASE_URL fails with an explanatory error', () => {
  const env = { ...process.env, DATABASE_URL: VALID_DATABASE_URL };
  delete env.DATABASE_URL;
  const result = runCheckEnv(env);
  assert.notEqual(result.status, 0, 'expected a non-zero exit status');
  assert.match(result.stderr, /DATABASE_URL is not set/);
});

test('reports detected Node and pnpm versions', () => {
  const result = runCheckEnv({
    ...process.env,
    DATABASE_URL: VALID_DATABASE_URL,
  });
  assert.match(result.stdout, /Node: v/);
  assert.match(result.stdout, /pnpm: /);
});

if (failures > 0) {
  console.error(`\n${failures} check-env.spec.ts assertion(s) failed.`);
  process.exit(1);
}

console.log('\nAll check-env.spec.ts assertions passed.');
