import { taskType } from '../contract';
import { MockAiProviderAdapter } from './mock.adapter';

// M19 — Unit test, no DB (this milestone touches no database at all —
// §26's explicit exclusions). Every value below is fictional.
describe('MockAiProviderAdapter (M19)', () => {
  it('is tagged kind: mock', () => {
    expect(new MockAiProviderAdapter().kind).toBe('mock');
  });

  it('returns a canned response for a fictional task_type, with no real model call', async () => {
    const adapter = new MockAiProviderAdapter();

    const result = await adapter.execute({
      requestId: 'fictional-request-id',
      taskType: taskType('fictional_conversational_turn'),
      systemInstructions: 'Fictional Leo persona instructions.',
      context: 'Fictional minimized conversation context.',
      taskInput: 'Fictional child utterance.',
    });

    expect(result.error).toBeNull();
    expect(result.safetyFlags).toEqual([]);
    expect(result.outputContent).toContain('fictional_conversational_turn');
    // providerMetadata is populated here deliberately — it is this
    // adapter's own raw return value; AdapterRegistry.execute() is
    // what strips it before a core-domain caller ever sees it (proven
    // in adapter-registry.spec.ts), not this adapter itself.
    expect(result.providerMetadata.mock).toBe(true);
    expect(result.providerMetadata.echoedRequestId).toBe('fictional-request-id');
  });
});
