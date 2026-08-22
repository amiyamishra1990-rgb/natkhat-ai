// M19 (docs/sprints/sprint-03.md, §4; ADR-0013 §6/Decision item 10).
// AI_PROVIDER_LEGAL_CLEARANCE_MARKERS is a mechanism, not a real
// clearance: Track B (any real provider SDK, API key, credential, or
// live model call) is blocked in this milestone, and no legal review
// (ai-provider-boundary.md §15/§23) has been performed for any
// provider. This env var exists solely so AdapterRegistry's refusal of
// a non-mock adapter (adapter-registry.ts) is a real, testable
// conditional check — "absent an explicit... marker" (this milestone's
// own security requirement) implies a marker-present branch must
// actually exist to test against, not an unconditional throw disguised
// as a check. Setting this in any real environment without an actual
// completed §15/§23 legal review would be a process violation this
// code cannot itself prevent — same disclaimer spirit as
// leo/leo.config.ts's LEO_MEMORY_KEK header.
export interface AiProviderConfig {
  legalClearanceMarkers: ReadonlySet<string>;
}

function parseLegalClearanceMarkersEnv(): ReadonlySet<string> {
  const raw = process.env.AI_PROVIDER_LEGAL_CLEARANCE_MARKERS;
  if (raw === undefined || raw === '') {
    return new Set();
  }
  return new Set(
    raw
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0),
  );
}

export function loadAiProviderConfig(): AiProviderConfig {
  return { legalClearanceMarkers: parseLegalClearanceMarkersEnv() };
}
