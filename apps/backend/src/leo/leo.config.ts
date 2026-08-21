// M18 (docs/sprints/sprint-03.md, §4; ADR-0012;
// docs/architecture/ai-memory-isolation.md §7.1, §7.5;
// docs/architecture/data-classification-and-isolation.md §5.2).
//
// LEO_MEMORY_KEK IS NOT A PRODUCTION KEY-MANAGEMENT DECISION.
// data-classification-and-isolation.md §5.2 designs per-Family
// envelope encryption (a DEK wrapped by a KEK held in a managed KMS)
// but §5.3/§11 explicitly leave the KMS product, key-rotation policy,
// and DEK-caching strategy undecided — "implementation-stage
// decisions, not resolved here." M18 is the first milestone to touch
// Tier-3 content at all (lifecycle.service.ts's own hard-delete-sweep
// comment, until this milestone, read "no per-Family DEK or Tier-3
// content exists in this codebase yet"), and there is no KMS to reuse.
//
// This env var is a synthetic-data-only, dev-only stopgap standing in
// for that undecided KMS — a single symmetric key read from the
// environment that wraps every Family's DEK, the same
// real-mechanism-explicitly-flagged-as-non-production spirit as M17's
// CONSENT_TRACK_A_ENABLED, applied here to a key-management gap
// instead of a feature gate. A real production deployment needs an
// actual managed key service (e.g. a GCP KMS key, per PROJECT.md's
// locked Approved Tech Stack) — selecting one, and a real rotation
// policy, is a future, separate engineering/founder decision, not
// authorized or substituted by this env var. Nobody should read
// LEO_MEMORY_KEK's presence in this codebase as evidence that KMS
// selection happened; it is explicitly the opposite.
//
// Fails closed, not silently-plaintext: every write/read path that
// needs a Family's DEK (leo-encryption.service.ts) throws
// LeoKekNotConfiguredError when this is unset, rather than falling
// back to storing Tier-3 content unencrypted.
export interface LeoConfig {
  /** Raw 32-byte AES-256 key, decoded from base64. Null if unset. */
  memoryKek: Buffer | null;
  /**
   * ai-memory-isolation.md §5.4 — version_history rows age out
   * independently of the current active row, default 90 days,
   * parent-configurable 30 days–1 year. Read from the environment for
   * the same reason every other retention window in this repository
   * is (lifecycle.config.ts, audit.config.ts) — never hardcoded.
   */
  versionHistoryRetentionDays: number;
}

const DEFAULT_VERSION_HISTORY_RETENTION_DAYS = 90;
const MIN_VERSION_HISTORY_RETENTION_DAYS = 30;
const MAX_VERSION_HISTORY_RETENTION_DAYS = 365;

function parseKekEnv(): Buffer | null {
  const raw = process.env.LEO_MEMORY_KEK;
  if (raw === undefined || raw === '') {
    return null;
  }
  const decoded = Buffer.from(raw, 'base64');
  if (decoded.length !== 32) {
    throw new Error(
      `LEO_MEMORY_KEK must be a base64-encoded 32-byte (AES-256) key, got ${decoded.length} bytes after decoding.`,
    );
  }
  return decoded;
}

function parseVersionHistoryRetentionDaysEnv(): number {
  const raw = process.env.LEO_VERSION_HISTORY_RETENTION_DAYS;
  if (raw === undefined || raw === '') {
    return DEFAULT_VERSION_HISTORY_RETENTION_DAYS;
  }
  const parsed = Number(raw);
  if (
    !Number.isInteger(parsed) ||
    parsed < MIN_VERSION_HISTORY_RETENTION_DAYS ||
    parsed > MAX_VERSION_HISTORY_RETENTION_DAYS
  ) {
    throw new Error(
      `LEO_VERSION_HISTORY_RETENTION_DAYS must be an integer between ${MIN_VERSION_HISTORY_RETENTION_DAYS} and ${MAX_VERSION_HISTORY_RETENTION_DAYS} (§5.4), got: ${raw}`,
    );
  }
  return parsed;
}

export function loadLeoConfig(): LeoConfig {
  return {
    memoryKek: parseKekEnv(),
    versionHistoryRetentionDays: parseVersionHistoryRetentionDaysEnv(),
  };
}
