// M17 (docs/sprints/sprint-03.md, §2.3/§4/§7 — "Track A requires only
// the standing M13-start authorization... Track B... blocked"; the
// sprint's own risk register: "Consent activation is feature-flagged
// separately from consent schema; default-off, requires a second
// explicit flag flip outside any milestone's Definition of Done").
//
// `docs/engineering/feature-flags.md`'s own Status line records that
// **no feature-flag system is implemented anywhere in this repository
// yet** — tool selection (SDK, remote config, targeting rules) is
// explicitly deferred to a future Decision Log entry or ADR, not a
// milestone concern. This is therefore a deliberate stopgap, not that
// future selection: a single boolean read from the environment, the
// same configuration-value pattern lifecycle/lifecycle.config.ts and
// audit/audit.config.ts already use for retention windows — not an
// SDK, not remote config, not a claim that this repository has adopted
// a real flagging tool. `consentService` refuses every write path
// (createChildWithFoundingConsent, withdrawConsent, recordRenewal)
// unless this is explicitly set true — off by default, per Sprint 03's
// rule that legally-gated functionality must never default to enabled.
export interface ConsentConfig {
  trackAEnabled: boolean;
}

function parseBooleanEnv(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return fallback;
  }
  if (raw === 'true') {
    return true;
  }
  if (raw === 'false') {
    return false;
  }
  throw new Error(`${name} must be "true" or "false", got: ${raw}`);
}

export function loadConsentConfig(): ConsentConfig {
  return {
    trackAEnabled: parseBooleanEnv('CONSENT_TRACK_A_ENABLED', false),
  };
}
