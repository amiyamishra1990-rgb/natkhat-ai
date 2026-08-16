// Repository environment check — Sprint 01, Milestone 1; extended at
// Sprint 03, Milestone 13 (docs/sprints/sprint-03.md, §4) to also
// validate the local-Postgres DATABASE_URL required by
// apps/backend (Decision J.5; ADR-0006 §29); extended again at
// Milestone 14 (docs/sprints/sprint-03.md, §4; ADR-0010 §7.4) for
// APP_DATABASE_URL, the non-superuser/non-BYPASSRLS request-serving
// role connection RLS is proven against.
import { execSync } from 'node:child_process';

function readVersion(command: string): string {
  return execSync(command).toString().trim();
}

function majorVersion(version: string): number {
  const match = version.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

const nodeVersion = process.version;
const nodeMajor = majorVersion(nodeVersion);

let pnpmVersion: string | null = null;
try {
  pnpmVersion = readVersion('pnpm --version');
} catch {
  pnpmVersion = null;
}

console.log(`Node: ${nodeVersion}`);
console.log(`pnpm: ${pnpmVersion ?? 'not found'}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'set' : 'not set'}`);
console.log(`APP_DATABASE_URL: ${process.env.APP_DATABASE_URL ? 'set' : 'not set'}`);

let ok = true;

if (nodeMajor < 20) {
  console.error('Node >= 20 is required (see .nvmrc).');
  ok = false;
}

if (!pnpmVersion) {
  console.error(
    'pnpm was not found on PATH. Enable it via: corepack enable && corepack prepare pnpm@9.15.4 --activate',
  );
  ok = false;
}

if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is not set. Copy apps/backend/.env.example to apps/backend/.env and point it at a local PostgreSQL instance.',
  );
  ok = false;
}

if (!process.env.APP_DATABASE_URL) {
  console.error(
    'APP_DATABASE_URL is not set. Copy apps/backend/.env.example to apps/backend/.env — it must point at the non-superuser natkhat_app_role the M14 migration creates, not the DATABASE_URL admin role.',
  );
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('Environment OK.');
