import { Inject, Injectable } from '@nestjs/common';
import { AiProviderAdapter } from './adapter.interface';
import { NeutralAiRequest, NeutralAiResponse } from './contract';
import { AI_PROVIDER_CONFIG } from './ai-provider.config.provider';
import type { AiProviderConfig } from './ai-provider.config';

export class AdapterRegistrationRefusedError extends Error {
  constructor(adapterId: string) {
    super(
      `Adapter "${adapterId}" is not a mock adapter and no legal-clearance marker is present — refusing to register it. Track B (any real provider adapter) is blocked (docs/sprints/sprint-03.md M19; ADR-0013 §6/Decision item 10) until a candidate provider's contract terms clear legal review.`,
    );
    this.name = 'AdapterRegistrationRefusedError';
  }
}

export class UnknownAdapterError extends Error {
  constructor(adapterId: string) {
    super(`No adapter is registered with id "${adapterId}".`);
    this.name = 'UnknownAdapterError';
  }
}

/**
 * M19 (docs/sprints/sprint-03.md, §4; ai-provider-boundary.md §5-§6).
 * The only place an `AiProviderAdapter` is looked up by id and
 * invoked. Two responsibilities, both structural, not conventions a
 * caller must remember:
 *
 * 1. **Refuses a non-mock adapter absent an explicit legal-clearance
 *    marker** (this milestone's own security/privacy requirement) —
 *    `register()` throws `AdapterRegistrationRefusedError` rather than
 *    silently accepting it. Since Track B is blocked, no real adapter
 *    exists anywhere in this codebase to register; this path is
 *    exercised only by test doubles (adapter-registry.spec.ts).
 * 2. **Strips `providerMetadata` before returning a response** — §4:
 *    "an opaque provider_metadata bag that stays inside the adapter
 *    and never propagates into core-domain logic or storage." A
 *    caller of `execute()` receives `NeutralAiResponse` only, which
 *    has no `providerMetadata` field at all — not merely an unused
 *    one.
 */
@Injectable()
export class AdapterRegistry {
  private readonly adapters = new Map<string, AiProviderAdapter>();

  constructor(@Inject(AI_PROVIDER_CONFIG) private readonly config: AiProviderConfig) {}

  register(adapter: AiProviderAdapter): void {
    if (adapter.kind !== 'mock' && !this.config.legalClearanceMarkers.has(adapter.id)) {
      throw new AdapterRegistrationRefusedError(adapter.id);
    }
    this.adapters.set(adapter.id, adapter);
  }

  async execute(adapterId: string, request: NeutralAiRequest): Promise<NeutralAiResponse> {
    const adapter = this.adapters.get(adapterId);
    if (!adapter) {
      throw new UnknownAdapterError(adapterId);
    }
    const result = await adapter.execute(request);
    return {
      outputContent: result.outputContent,
      safetyFlags: result.safetyFlags,
      error: result.error,
    };
  }
}
