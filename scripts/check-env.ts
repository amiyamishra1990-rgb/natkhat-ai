// Repository environment check — Sprint 01, Milestone 1.
// Verifies local tooling versions only. No app/database/auth
// environment variables exist yet, so there is nothing else to
// validate until later milestones add apps and env schemas.
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

if (!ok) {
  process.exit(1);
}

console.log('Environment OK.');
