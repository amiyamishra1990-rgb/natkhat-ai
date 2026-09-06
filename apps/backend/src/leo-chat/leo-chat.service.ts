import { randomUUID } from 'node:crypto';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { DecryptedMessage, LeoChatNotAuthorizedError, LeoService } from '../leo/leo.service';
import { AuthorizationService } from '../authorization/authorization.service';
import { PrincipalType } from '../authorization/authorization.types';
import { AdapterRegistry } from '../ai-provider/adapter-registry';
import { MockAiProviderAdapter } from '../ai-provider/adapters/mock.adapter';
import { NeutralAiRequest, taskType } from '../ai-provider/contract';

export interface LeoChatTurn {
  childMessage: DecryptedMessage;
  leoMessage: DecryptedMessage;
}

/**
 * M27 (docs/sprints/sprint-06.md, §7; founder decisions H.2/H.6). The
 * one place `LeoService` (core domain, `src/leo/`) and
 * `AdapterRegistry` (the AI-provider boundary, `src/ai-provider/`) are
 * wired together for a real request — the same manual sequencing
 * `test/vertical-slice.e2e-spec.ts` step 5 already proved works,
 * turned into real production code for the first time.
 *
 * Deliberately lives outside `src/leo/`:
 * `ai-provider-boundary-contract.spec.ts` forbids every file under
 * `src/leo/` (and every other listed core-domain module) from
 * importing anything from `ai-provider/` at all, per
 * ai-provider-boundary.md §3/§6 ("no M1-M7 entity... may ever
 * reference a provider-specific concept... core-domain entities
 * interact only with the neutral contract"). `LeoService` itself is
 * untouched by this milestone — reused exactly as M18/M23 left it, not
 * reimplemented — this class is the boundary-crossing orchestration
 * layer that document always assumed would exist *outside* core
 * domain, the production-code counterpart to what the vertical-slice
 * test already did manually.
 *
 * Mock adapter only, per H.2/H.6 and ADR-0013's own Track-B block on
 * any real provider — `AdapterRegistry.register()` would refuse a
 * non-mock adapter anyway (adapter-registry.ts), but this class never
 * constructs or offers one; `MockAiProviderAdapter` is injected
 * directly, by concrete type, not looked up by a configurable id.
 */
@Injectable()
export class LeoChatService implements OnModuleInit {
  constructor(
    private readonly leoService: LeoService,
    private readonly authorizationService: AuthorizationService,
    private readonly adapterRegistry: AdapterRegistry,
    private readonly mockAdapter: MockAiProviderAdapter,
  ) {}

  /**
   * `AiProviderModule` deliberately does not auto-register the mock
   * adapter itself (ai-provider.module.ts's own comment: "nothing in
   * this milestone's scope yet calls AdapterRegistry.execute() for a
   * real product feature") — M27 is that first real consumer, so
   * registration happens here, once, at module init.
   */
  onModuleInit(): void {
    this.adapterRegistry.register(this.mockAdapter);
  }

  /**
   * Persists the caller-relayed child message, then calls the mock
   * adapter and persists its canned reply as a Leo-sender `Message` —
   * proving the request/reply loop end to end with fake data (M27's
   * own scope). Both writes go through `LeoService.appendMessage`
   * unmodified, so M23's `interact_with_leo` gate and the
   * conversationId/familyId/childId re-validation it already performs
   * apply identically to each — no new authorization mechanism, no
   * weakened check, defense-in-depth inherited rather than
   * reimplemented.
   *
   * Per H.1 (Leo's character brief not yet approved) and this
   * milestone's own explicit boundary: `systemInstructions` here stays
   * the same generic, non-personality-shaped placeholder text
   * `test/vertical-slice.e2e-spec.ts` step 5 already used — this is
   * plumbing, not Leo's voice, and the mock adapter's own canned
   * response text (mock.adapter.ts) is left completely untouched.
   */
  async sendMessage(params: {
    conversationId: string;
    familyId: string;
    childId: string;
    content: string;
    principalId: string;
    principalType: PrincipalType;
  }): Promise<LeoChatTurn> {
    const childMessage = await this.leoService.appendMessage({
      conversationId: params.conversationId,
      familyId: params.familyId,
      childId: params.childId,
      sender: 'child',
      content: params.content,
      principalId: params.principalId,
      principalType: params.principalType,
    });

    // Same minimization discipline test/vertical-slice.e2e-spec.ts's
    // step 5 already established: no family/child/parent identifier,
    // display name, or email anywhere in this request — only the
    // message content itself (already the minimized excerpt this task
    // needs) and a fresh, opaque requestId (contract.ts §8/§10).
    const aiRequest: NeutralAiRequest = {
      requestId: randomUUID(),
      taskType: taskType('leo_conversational_turn'),
      systemInstructions:
        'You are Leo, a friendly companion for a child. Reply kindly and briefly.',
      context: 'A child is having a casual conversation with Leo.',
      taskInput: childMessage.content,
    };

    const aiResponse = await this.adapterRegistry.execute(this.mockAdapter.id, aiRequest);

    const leoMessage = await this.leoService.appendMessage({
      conversationId: params.conversationId,
      familyId: params.familyId,
      childId: params.childId,
      sender: 'leo',
      content: aiResponse.outputContent,
      principalId: params.principalId,
      principalType: params.principalType,
    });

    return { childMessage, leoMessage };
  }

  /**
   * `LeoService.listMessages` (leo.service.ts) carries no internal
   * `interact_with_leo` check of its own — only `startConversation`/
   * `appendMessage` do (see that file's own class-header comment,
   * unchanged by this milestone). This milestone's scope requires
   * "every route" through the M27 HTTP surface to go through that
   * gate, so this wrapper applies the identical M23 two-gate check
   * (`AuthorizationService.authorize(...)`, `interact_with_leo`) here,
   * at the boundary, before delegating — same mechanism M23 already
   * built and `LeoService`'s own private `assertLeoChatAuthorized`
   * already calls internally for the other two methods, reused as-is,
   * not reimplemented or weakened. `LeoService.listMessages` itself is
   * left completely untouched, so its own existing tests/call sites
   * are unaffected.
   */
  async listMessages(params: {
    conversationId: string;
    familyId: string;
    childId: string;
    principalId: string;
    principalType: PrincipalType;
  }): Promise<DecryptedMessage[]> {
    const result = await this.authorizationService.authorize({
      principalId: params.principalId,
      principalType: params.principalType,
      requestedFamilyId: params.familyId,
      requestedAction: 'interact_with_leo',
    });
    if (!result.allowed) {
      throw new LeoChatNotAuthorizedError();
    }

    return this.leoService.listMessages({
      conversationId: params.conversationId,
      familyId: params.familyId,
      childId: params.childId,
    });
  }
}
