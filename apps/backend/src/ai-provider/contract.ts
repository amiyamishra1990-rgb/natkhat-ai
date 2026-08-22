// M19 (docs/sprints/sprint-03.md, §4; ADR-0013 Decision items 1-2;
// docs/architecture/ai-provider-boundary.md §4). The neutral request/
// response contract — a conceptual shape there ("not a schema, type
// definition, or library. No SDK is implied or required"), made
// concrete here as real TypeScript types only, per this milestone's
// own authorization (§24: "the neutral contract... as real types/
// interfaces (no core-domain change)"). No field here may ever hold a
// provider-specific value (§3, ADR-0013 Decision item 1) — see
// adapter.interface.ts for how a provider's own translation is kept
// out of this shape, and ai-provider-boundary-contract.spec.ts for the
// automated check that no M14-M18 module imports anything from this
// directory at all.

/**
 * §4 — task_type: "A closed, provider-agnostic enum (e.g. a
 * conversational turn, a future memory-derivation task) — never a
 * provider-specific operation name." No real task_type value is
 * enumerated anywhere in ai-provider-boundary.md — §9.1 is explicit
 * that "enumerating real task types is itself implementation-adjacent
 * — out of scope here." Modeled as a branded string, not a fabricated
 * TS union of invented task names, for the same reason schema.prisma's
 * own header comment already gives for
 * CoParentAssignment.permissionScope/ConsentEvent.verificationMethod:
 * "not enumerated by the approved documents... avoid inventing a
 * bounded set the governing documents do not themselves fix." A future
 * milestone that actually implements a task pipeline is the correct
 * place to narrow this to a real closed set.
 */
export type TaskType = string & { readonly __brand: 'TaskType' };

export function taskType(value: string): TaskType {
  return value as TaskType;
}

/** §4 — conceptual output constraints (e.g. safety level, length) — never a provider-specific parameter name. */
export interface NeutralAiConstraints {
  safetyLevel?: string;
  maxOutputLength?: number;
}

/**
 * §4's request table, field-for-field. `requestId` is opaque and
 * Natkhat-AI-generated — never derived from or containing
 * family_id/child_id/parent_id (§8, §10); `context`/`taskInput` are
 * expected to already be the minimized, task-specific excerpt §9
 * requires — this type does not itself enforce minimization (that is
 * a future boundary checkpoint, §9/§21, not built by this milestone).
 */
export interface NeutralAiRequest {
  requestId: string;
  taskType: TaskType;
  systemInstructions: string;
  context: string;
  taskInput: string;
  constraints?: NeutralAiConstraints;
}

export interface NeutralAiError {
  code: string;
  /**
   * §17 — "Must not surface raw provider error text (which may contain
   * provider-internal debug detail) directly to a child." A real
   * adapter's own translation step is responsible for producing a
   * safe, generic message here, never the provider's raw error body.
   */
  message: string;
}

/**
 * §4's response table, minus `provider_metadata` — that field
 * "stays inside the adapter (§5) and never propagates into
 * core-domain logic or storage." It exists only on
 * `AdapterExecutionResult` below, an adapter's own raw return value;
 * `AdapterRegistry.execute()` (adapter-registry.ts) strips it before
 * returning to any caller, so `NeutralAiResponse` — what a core-domain
 * caller actually receives — structurally cannot carry it.
 */
export interface NeutralAiResponse {
  outputContent: string;
  safetyFlags: string[];
  error: NeutralAiError | null;
}

/** What an adapter's own `execute()` returns — see this file's header comment on `providerMetadata`. */
export interface AdapterExecutionResult extends NeutralAiResponse {
  providerMetadata: Record<string, unknown>;
}
