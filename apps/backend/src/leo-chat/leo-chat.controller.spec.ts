import { BadRequestException } from '@nestjs/common';
import { LeoChatController } from './leo-chat.controller';

// M27 — unit tests for the controller's own request-shape validation
// and delegation to LeoService/LeoChatService, isolated from both
// services' real logic (covered separately by
// leo/leo-chat-authorization.integration.spec.ts and
// test/leo-chat-api.e2e-spec.ts). Constructs the controller directly
// with jest-mocked collaborators, same lightweight style
// admin-auth/admin-auth.guard.spec.ts already uses for a guard —
// applied here to a controller instead.
describe('LeoChatController', () => {
  const parent = { id: 'parent-1', authIdentityRef: 'firebase-parent-1' } as never;

  function buildController() {
    const leoService = {
      startConversation: jest.fn(),
      listMessages: jest.fn(),
    };
    const leoChatService = {
      sendMessage: jest.fn(),
      listMessages: jest.fn(),
    };
    const controller = new LeoChatController(leoService as never, leoChatService as never);
    return { controller, leoService, leoChatService };
  }

  describe('POST /leo/conversations (startConversation)', () => {
    it('rejects a missing familyId', () => {
      const { controller } = buildController();
      expect(() =>
        controller.startConversation({ familyId: '', childId: 'child-1' }, parent),
      ).toThrow(BadRequestException);
    });

    it('rejects a missing childId', () => {
      const { controller } = buildController();
      expect(() => controller.startConversation({ familyId: 'family-1' } as never, parent)).toThrow(
        BadRequestException,
      );
    });

    it('delegates to LeoService.startConversation with the authenticated parent as principal', async () => {
      const { controller, leoService } = buildController();
      const conversation = { id: 'conversation-1' };
      leoService.startConversation.mockResolvedValue(conversation);

      const result = await controller.startConversation(
        { familyId: 'family-1', childId: 'child-1' },
        parent,
      );

      expect(result).toBe(conversation);
      expect(leoService.startConversation).toHaveBeenCalledWith({
        familyId: 'family-1',
        childId: 'child-1',
        principalId: 'parent-1',
        principalType: 'Parent',
      });
    });
  });

  describe('POST /leo/conversations/:conversationId/messages (sendMessage)', () => {
    it('rejects a missing content', () => {
      const { controller } = buildController();
      expect(() =>
        controller.sendMessage(
          'conversation-1',
          { familyId: 'family-1', childId: 'child-1' } as never,
          parent,
        ),
      ).toThrow(BadRequestException);
    });

    it('delegates to LeoChatService.sendMessage with the authenticated parent as principal', async () => {
      const { controller, leoChatService } = buildController();
      const turn = { childMessage: { id: 'm1' }, leoMessage: { id: 'm2' } };
      leoChatService.sendMessage.mockResolvedValue(turn);

      const result = await controller.sendMessage(
        'conversation-1',
        { familyId: 'family-1', childId: 'child-1', content: 'hi Leo' },
        parent,
      );

      expect(result).toBe(turn);
      expect(leoChatService.sendMessage).toHaveBeenCalledWith({
        conversationId: 'conversation-1',
        familyId: 'family-1',
        childId: 'child-1',
        content: 'hi Leo',
        principalId: 'parent-1',
        principalType: 'Parent',
      });
    });
  });

  describe('GET /leo/conversations/:conversationId/messages (listMessages)', () => {
    it('rejects a missing familyId query param', () => {
      const { controller } = buildController();
      expect(() => controller.listMessages('conversation-1', '', 'child-1', parent)).toThrow(
        BadRequestException,
      );
    });

    it('delegates to LeoChatService.listMessages (not LeoService directly) with the authenticated parent as principal', async () => {
      const { controller, leoService, leoChatService } = buildController();
      const transcript = [{ id: 'm1' }];
      leoChatService.listMessages.mockResolvedValue(transcript);

      const result = await controller.listMessages('conversation-1', 'family-1', 'child-1', parent);

      expect(result).toBe(transcript);
      expect(leoChatService.listMessages).toHaveBeenCalledWith({
        conversationId: 'conversation-1',
        familyId: 'family-1',
        childId: 'child-1',
        principalId: 'parent-1',
        principalType: 'Parent',
      });
      // Regression guard for the gap this milestone's own
      // leo-chat.service.ts comment documents: LeoService.listMessages
      // has no internal interact_with_leo check, so the controller
      // must never call it directly, only via the gated
      // LeoChatService.listMessages wrapper.
      expect(leoService.listMessages).not.toHaveBeenCalled();
    });
  });
});
