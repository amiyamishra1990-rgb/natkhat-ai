// M16 (docs/sprints/sprint-03.md, §4; ADR-0015 §13.1–§13.2). Both
// windows are founder-APPROVED (not provisional, unlike Tier-5
// retention — see audit/audit.config.ts) at 90 days, but are still
// read from the environment rather than hardcoded: the sprint's own
// risk register (§7) generalizes the "don't hardcode a retention
// window" lesson to this milestone as a whole, and a future refinement
// data-lifecycle.md §13.1 itself flags ("Tier 3 content... could
// reasonably use a shorter window than Tier 1/2") is easier to apply
// later if the value was never a literal in the code to begin with.
export interface LifecycleConfig {
  softToHardDeleteDays: number;
  backupPurgeDays: number;
}

const DEFAULT_SOFT_TO_HARD_DELETE_DAYS = 90;
const DEFAULT_BACKUP_PURGE_DAYS = 90;

function parsePositiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return fallback;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer, got: ${raw}`);
  }
  return parsed;
}

export function loadLifecycleConfig(): LifecycleConfig {
  return {
    softToHardDeleteDays: parsePositiveIntEnv(
      'LIFECYCLE_SOFT_TO_HARD_DELETE_DAYS',
      DEFAULT_SOFT_TO_HARD_DELETE_DAYS,
    ),
    backupPurgeDays: parsePositiveIntEnv('LIFECYCLE_BACKUP_PURGE_DAYS', DEFAULT_BACKUP_PURGE_DAYS),
  };
}
