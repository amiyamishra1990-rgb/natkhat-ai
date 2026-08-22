import { AdapterExecutionResult, NeutralAiRequest } from './contract';

/**
 * M19 (docs/sprints/sprint-03.md, §4; ADR-0013 Decision item 2;
 * ai-provider-boundary.md §5). Every provider — commercial or
 * self-hosted — is integrated behind its own adapter implementing this
 * interface: translate a neutral request into that provider's call
 * shape, translate the response back. Provider-specific concerns (API
 * endpoint, auth header format, model identifier, prompt-formatting
 * conventions, token limits) live only inside a concrete
 * implementation of `execute()` — never leak into this interface
 * itself or into any core-domain module (enforced structurally by
 * `AdapterRegistry`, adapter-registry.ts, and proven by
 * ai-provider-boundary-contract.spec.ts).
 */
export type AdapterKind = 'mock' | 'real';

export interface AiProviderAdapter {
  /** Unique within a given AdapterRegistry — never a provider brand name by itself (that would be a provider-specific concept leaking into a shared identifier space). */
  readonly id: string;
  /**
   * §21/this milestone's own security requirement — "the adapter
   * registry should structurally refuse to load a non-mock adapter
   * absent an explicit, separately-flagged legal-clearance marker."
   * `kind` is what `AdapterRegistry.register()` inspects to enforce
   * that. Track B (any `kind: 'real'` adapter) is blocked in this
   * milestone — no such adapter is implemented anywhere in this
   * module; only test doubles ever construct one, and only to prove
   * the registry's refusal path actually discriminates by this field.
   */
  readonly kind: AdapterKind;
  execute(request: NeutralAiRequest): Promise<AdapterExecutionResult>;
}
