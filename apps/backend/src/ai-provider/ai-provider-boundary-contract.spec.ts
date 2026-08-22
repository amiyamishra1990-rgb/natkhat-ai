import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * M19 (docs/sprints/sprint-03.md, §4; ADR-0013 Decision item 1;
 * ai-provider-boundary.md §3, §6, §20; this milestone's own explicit
 * testing requirement: "a contract test asserting no provider-specific
 * leakage into core-domain entities"). Every M14-M18 core-domain
 * module must remain completely unaware this directory exists —
 * swapping or adding an adapter here must never require touching any
 * of them, this milestone's own Definition of Done. Scans real source
 * files on disk rather than asserting the invariant from memory, since
 * an import-boundary rule like this silently rots without an enforced
 * check — the same "verify against what actually exists in the
 * repository" discipline every M14-M18 PR has already followed.
 */
const CORE_DOMAIN_MODULE_DIRS = [
  'identity-family',
  'auth',
  'authorization',
  'lifecycle',
  'audit',
  'consent',
  'leo',
];

function listTsFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
    .map((entry) => join(entry.parentPath, entry.name));
}

describe('AI-provider boundary contract (M19)', () => {
  it('no M14-M18 core-domain module imports anything from ai-provider/', () => {
    const srcRoot = join(__dirname, '..');
    const offendingImports: string[] = [];

    for (const moduleDir of CORE_DOMAIN_MODULE_DIRS) {
      const dir = join(srcRoot, moduleDir);
      for (const filePath of listTsFiles(dir)) {
        const content = readFileSync(filePath, 'utf8');
        if (/from\s+['"][^'"]*ai-provider/.test(content)) {
          offendingImports.push(filePath);
        }
      }
    }

    expect(offendingImports).toEqual([]);
  });

  it('sanity check — the scan itself actually inspects a non-trivial number of files (guards against a silently-empty/misconfigured glob)', () => {
    const srcRoot = join(__dirname, '..');
    const totalFiles = CORE_DOMAIN_MODULE_DIRS.reduce(
      (count, moduleDir) => count + listTsFiles(join(srcRoot, moduleDir)).length,
      0,
    );
    expect(totalFiles).toBeGreaterThan(20);
  });
});
