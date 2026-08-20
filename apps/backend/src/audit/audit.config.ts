// M16 (docs/sprints/sprint-03.md, §4 — "the Tier-5 retention period
// implemented as a configuration value... never hardcoded"; §7 Risk
// Register — "M16's audit-log retention gets hardcoded, requiring a
// redeploy when DPDP review changes it" is the specific risk this file
// exists to close). ADR-0015 §13.3: 3 years, APPROVED PROVISIONALLY —
// still subject to change pending India DPDP Act legal review
// (ADR-0006 §30). Reading this from the environment, with the current
// provisional value only as the *default*, is what "configuration
// value, not a constant" means in practice — the number can change
// without a code change once legal review concludes.
export interface AuditConfig {
  tier5RetentionYears: number;
}

const DEFAULT_TIER5_RETENTION_YEARS = 3;

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

export function loadAuditConfig(): AuditConfig {
  return {
    tier5RetentionYears: parsePositiveIntEnv(
      'AUDIT_TIER5_RETENTION_YEARS',
      DEFAULT_TIER5_RETENTION_YEARS,
    ),
  };
}
