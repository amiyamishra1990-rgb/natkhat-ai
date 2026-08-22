import { Injectable } from '@nestjs/common';
import { AdapterKind, AiProviderAdapter } from '../adapter.interface';
import { AdapterExecutionResult, NeutralAiRequest } from '../contract';

/**
 * M19 (docs/sprints/sprint-03.md, §4: "one mock adapter returning
 * canned responses"). Returns a fixed, fictional response for any
 * request — no network call, no SDK, no real model of any kind. This
 * is the only adapter this milestone ships; Track B (a real provider
 * adapter) is explicitly blocked.
 */
@Injectable()
export class MockAiProviderAdapter implements AiProviderAdapter {
  readonly id = 'mock';
  readonly kind: AdapterKind = 'mock';

  async execute(request: NeutralAiRequest): Promise<AdapterExecutionResult> {
    return {
      outputContent: `Fictional canned response for task_type "${request.taskType}" — no real model was called.`,
      safetyFlags: [],
      error: null,
      // Deliberately non-empty and echoing requestId — proves
      // AdapterRegistry.execute() actually strips this field (§4)
      // rather than the test merely asserting an absence that was
      // never present to begin with.
      providerMetadata: { mock: true, echoedRequestId: request.requestId },
    };
  }
}
