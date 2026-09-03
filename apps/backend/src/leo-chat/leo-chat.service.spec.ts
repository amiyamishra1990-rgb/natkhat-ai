import { LeoChatService } from './leo-chat.service';
import { LeoChatNotAuthorizedError } from '../leo/leo.service';

// M27 — unit tests for the orchestration logic itself (mock-adapter
// registration at module init, the child-message -> AI-request ->
// leo-reply sequencing, and the listMessages authorization gate this
// class adds on top of LeoService.listMessages — see that method's own
// header comment for why it's needed here). All collaborators are
// jest-mocked; the real, wired-together behavior against a real
// Postgres instance is proven separately by
// test/leo-chat-api.e2e-spec.ts.
describe('LeoChatService', () => {
  function buildService() {
    const leoService = { appendMessage: jest.fn(), listMessages: jest.fn() };
    const authorizationService = { authorize: jest.fn() };
    const adapterRegistry = { register: jest.fn(), execute: jest.fn() };
    const mockAdapter = { id: 'mock', kind: 'mock' };
    const service = new LeoChatService(
      leoService as never,
      authorizationService as never,
      adapterRegistry as never,
      mockAdapter as never,
    );
    return { service, leoService, authorizationService, adapterRegistry, mockAdapter };
  }

  it('onModuleInit registers the mock adapter with the AdapterRegistry', () => {
    const { service, adapterRegistry, mockAdapter } = buildService();

    service.onModuleInit();

    expect(adapterRegistry.register).toHaveBeenCalledWith(mockAdapter);
  });

  describe('sendMessage', () => {
    it('persists the child message, calls the mock adapter, and persists the reply as a Leo-sender message', async () => {
      const { service, leoService, adapterRegistry, mockAdapter } = buildService();
      const childMessage = {
        id: 'child-msg-1',
        sender: 'child',
        content: 'hi Leo',
        createdAt: new Date(),
      };
      const leoMessage = {
        id: 'leo-msg-1',
        sender: 'leo',
        content: 'Fictional canned response',
        createdAt: new Date(),
      };
      leoService.appendMessage
        .mockResolvedValueOnce(childMessage)
        .mockResolvedValueOnce(leoMessage);
      adapterRegistry.execute.mockResolvedValue({
        outputContent: 'Fictional canned response',
        safetyFlags: [],
        error: null,
      });

      const result = await service.sendMessage({
        conversationId: 'conversation-1',
        familyId: 'family-1',
        childId: 'child-1',
        content: 'hi Leo',
        principalId: 'parent-1',
        principalType: 'Parent',
      });

      expect(result).toEqual({ childMessage, leoMessage });

      // Child message persisted first, as sender 'child'.
      expect(leoService.appendMessage).toHaveBeenNthCalledWith(1, {
        conversationId: 'conversation-1',
        familyId: 'family-1',
        childId: 'child-1',
        sender: 'child',
        content: 'hi Leo',
        principalId: 'parent-1',
        principalType: 'Parent',
      });

      // The mock adapter is called with the persisted (decrypted)
      // child content, never any family/child/parent identifier.
      expect(adapterRegistry.execute).toHaveBeenCalledWith(
        mockAdapter.id,
        expect.objectContaining({
          taskInput: 'hi Leo',
          systemInstructions: expect.any(String),
          requestId: expect.any(String),
        }),
      );
      const sentRequest = adapterRegistry.execute.mock.calls[0][1];
      expect(JSON.stringify(sentRequest)).not.toContain('family-1');
      expect(JSON.stringify(sentRequest)).not.toContain('child-1');
      expect(JSON.stringify(sentRequest)).not.toContain('parent-1');

      // The adapter's reply is persisted second, as sender 'leo'.
      expect(leoService.appendMessage).toHaveBeenNthCalledWith(2, {
        conversationId: 'conversation-1',
        familyId: 'family-1',
        childId: 'child-1',
        sender: 'leo',
        content: 'Fictional canned response',
        principalId: 'parent-1',
        principalType: 'Parent',
      });
    });

    it('propagates LeoChatNotAuthorizedError from appendMessage without calling the adapter', async () => {
      const { service, leoService, adapterRegistry } = buildService();
      leoService.appendMessage.mockRejectedValue(new LeoChatNotAuthorizedError());

      await expect(
        service.sendMessage({
          conversationId: 'conversation-1',
          familyId: 'family-1',
          childId: 'child-1',
          content: 'hi Leo',
          principalId: 'stranger-1',
          principalType: 'Parent',
        }),
      ).rejects.toThrow(LeoChatNotAuthorizedError);

      expect(adapterRegistry.execute).not.toHaveBeenCalled();
    });
  });

  describe('listMessages', () => {
    it('denies and never calls LeoService.listMessages when interact_with_leo is not authorized', async () => {
      const { service, leoService, authorizationService } = buildService();
      authorizationService.authorize.mockResolvedValue({
        allowed: false,
        reason: 'family_not_authorized',
      });

      await expect(
        service.listMessages({
          conversationId: 'conversation-1',
          familyId: 'family-1',
          childId: 'child-1',
          principalId: 'stranger-1',
          principalType: 'Parent',
        }),
      ).rejects.toThrow(LeoChatNotAuthorizedError);

      expect(authorizationService.authorize).toHaveBeenCalledWith({
        principalId: 'stranger-1',
        principalType: 'Parent',
        requestedFamilyId: 'family-1',
        requestedAction: 'interact_with_leo',
      });
      expect(leoService.listMessages).not.toHaveBeenCalled();
    });

    it('delegates to LeoService.listMessages when authorized', async () => {
      const { service, leoService, authorizationService } = buildService();
      authorizationService.authorize.mockResolvedValue({ allowed: true, role: 'owner' });
      const transcript = [{ id: 'm1' }];
      leoService.listMessages.mockResolvedValue(transcript);

      const result = await service.listMessages({
        conversationId: 'conversation-1',
        familyId: 'family-1',
        childId: 'child-1',
        principalId: 'owner-1',
        principalType: 'Parent',
      });

      expect(result).toBe(transcript);
      expect(leoService.listMessages).toHaveBeenCalledWith({
        conversationId: 'conversation-1',
        familyId: 'family-1',
        childId: 'child-1',
      });
    });
  });
});
