import {
  AdapterRegistrationRefusedError,
  AdapterRegistry,
  UnknownAdapterError,
} from './adapter-registry';
import { MockAiProviderAdapter } from './adapters/mock.adapter';
import { taskType } from './contract';
import type { AiProviderAdapter } from './adapter.interface';
import type { AdapterExecutionResult, NeutralAiRequest } from './contract';

// A fictional, test-only stand-in for a "real" adapter — never a real
// vendor SDK or integration. Exists solely to prove the registry's
// refusal mechanism actually discriminates by `kind`/legal-clearance
// marker, not merely throws unconditionally.
class FictionalNonMockAdapter implements AiProviderAdapter {
  readonly id = 'fictional-non-mock-adapter';
  readonly kind = 'real' as const;
  async execute(): Promise<AdapterExecutionResult> {
    return { outputContent: '', safetyFlags: [], error: null, providerMetadata: {} };
  }
}

const fictionalRequest: NeutralAiRequest = {
  requestId: 'fictional-request-id',
  taskType: taskType('fictional_task'),
  systemInstructions: 'fictional',
  context: 'fictional',
  taskInput: 'fictional',
};

// M19 — Unit test, no DB. Every value here is fictional; no real
// provider adapter is constructed anywhere in this file.
describe('AdapterRegistry (M19)', () => {
  it('registers a mock adapter with no legal-clearance marker required', () => {
    const registry = new AdapterRegistry({ legalClearanceMarkers: new Set() });
    expect(() => registry.register(new MockAiProviderAdapter())).not.toThrow();
  });

  it('refuses to register a non-mock adapter absent a legal-clearance marker — Track B is blocked (M19)', () => {
    const registry = new AdapterRegistry({ legalClearanceMarkers: new Set() });
    expect(() => registry.register(new FictionalNonMockAdapter())).toThrow(
      AdapterRegistrationRefusedError,
    );
  });

  it('accepts a non-mock adapter only when its id has an explicit legal-clearance marker', () => {
    const registry = new AdapterRegistry({
      legalClearanceMarkers: new Set(['fictional-non-mock-adapter']),
    });
    expect(() => registry.register(new FictionalNonMockAdapter())).not.toThrow();
  });

  it('a legal-clearance marker for a different adapter id does not clear this one', () => {
    const registry = new AdapterRegistry({
      legalClearanceMarkers: new Set(['some-other-adapter-id']),
    });
    expect(() => registry.register(new FictionalNonMockAdapter())).toThrow(
      AdapterRegistrationRefusedError,
    );
  });

  it('strips provider_metadata before returning a response to the caller (§4)', async () => {
    const registry = new AdapterRegistry({ legalClearanceMarkers: new Set() });
    registry.register(new MockAiProviderAdapter());

    const response = await registry.execute('mock', fictionalRequest);

    expect(response).not.toHaveProperty('providerMetadata');
    expect(response.outputContent.length).toBeGreaterThan(0);
  });

  it('throws UnknownAdapterError for an unregistered adapter id', async () => {
    const registry = new AdapterRegistry({ legalClearanceMarkers: new Set() });
    await expect(registry.execute('nonexistent', fictionalRequest)).rejects.toThrow(
      UnknownAdapterError,
    );
  });

  it('Definition of Done — swapping the mock adapter for a second mock adapter requires no change to any other module', async () => {
    // Defined entirely inline, in this test file — proving the swap
    // needs no change to adapter.interface.ts, adapter-registry.ts, or
    // any M14-M18 module, only a new class satisfying the existing
    // interface.
    class AlternateMockAdapter implements AiProviderAdapter {
      readonly id = 'alternate-mock';
      readonly kind = 'mock' as const;
      async execute(): Promise<AdapterExecutionResult> {
        return {
          outputContent: 'alternate fictional canned response',
          safetyFlags: [],
          error: null,
          providerMetadata: { mock: true },
        };
      }
    }

    const registry = new AdapterRegistry({ legalClearanceMarkers: new Set() });
    expect(() => registry.register(new AlternateMockAdapter())).not.toThrow();

    const response = await registry.execute('alternate-mock', fictionalRequest);
    expect(response.outputContent).toBe('alternate fictional canned response');
  });
});
