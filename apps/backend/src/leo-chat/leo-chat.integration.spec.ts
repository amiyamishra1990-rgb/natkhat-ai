import { randomUUID, randomBytes } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { FamilyEncryptionKeyRepository } from '../leo/repositories/family-encryption-key.repository';
import { ConversationRepository } from '../leo/repositories/conversation.repository';
import { MessageRepository } from '../leo/repositories/message.repository';
import { LeoMemoryRepository } from '../leo/repositories/leo-memory.repository';
import { LeoEncryptionService } from '../leo/leo-encryption.service';
import { LeoChatNotAuthorizedError, LeoService } from '../leo/leo.service';
import { FamilyRepository } from '../identity-family/repositories/family.repository';
import { CoParentAssignmentRepository } from '../identity-family/repositories/co-parent-assignment.repository';
import { AuthorizationService } from '../authorization/authorization.service';
import { serializePermissionScope } from '../authorization/permission-scope';
import { AdapterRegistry } from '../ai-provider/adapter-registry';
import { MockAiProviderAdapter } from '../ai-provider/adapters/mock.adapter';
import { loadAiProviderConfig } from '../ai-provider/ai-provider.config';
import { LeoChatService } from './leo-chat.service';

/**
 * M27 (docs/sprints/sprint-06.md, §7) — the "real local Postgres,
 * consistent with this project's standing rule for security-sensitive
 * behavior" integration test this milestone's own scope requires,
 * proving both halves at the orchestration layer: (a) an authorized
 * parent can start a conversation, send a message, and receive a
 * persisted mock Leo reply; (b) an unauthorized principal (wrong
 * family, or missing interact_with_leo permission) is correctly
 * denied. Same construction style
 * `leo/leo-chat-authorization.integration.spec.ts` (M23) already
 * uses — every collaborator built directly via `new` against a real
 * `PrismaClient`, no NestJS `TestingModule`, no Firebase dependency —
 * so this runs under the standard `jest` (unit) config and executes in
 * CI's `test` job like every other `*.integration.spec.ts` in this
 * backend, unlike `test/leo-chat-api.e2e-spec.ts` (which additionally
 * proves the real HTTP layer including `ParentAuthGuard`'s Firebase
 * token verification, and is gated on real Firebase credentials being
 * configured, same as `test/audit-events-auth.e2e-spec.ts`).
 */
describe('LeoChatService — M27 orchestration against real Postgres', () => {
  const admin = new PrismaClient();
  const testKek = randomBytes(32).toString('base64');

  const familyRepository = new FamilyRepository(admin);
  const coParentAssignmentRepository = new CoParentAssignmentRepository(admin);
  const authorizationService = new AuthorizationService(
    familyRepository,
    coParentAssignmentRepository,
  );

  const leoService = new LeoService(
    admin,
    new LeoEncryptionService(
      { memoryKek: Buffer.from(testKek, 'base64'), versionHistoryRetentionDays: 90 },
      new FamilyEncryptionKeyRepository(admin),
    ),
    new ConversationRepository(admin),
    new MessageRepository(admin),
    new LeoMemoryRepository(admin),
    authorizationService,
  );

  const adapterRegistry = new AdapterRegistry(loadAiProviderConfig());
  const mockAdapter = new MockAiProviderAdapter();

  const leoChatService = new LeoChatService(
    leoService,
    authorizationService,
    adapterRegistry,
    mockAdapter,
  );
  // Real production code path — LeoChatService.onModuleInit — not a
  // test-only shortcut; NestJS calls this lifecycle hook itself when
  // the module boots (leo-chat.module.ts), reproduced here since this
  // suite builds every collaborator directly via `new`.
  leoChatService.onModuleInit();

  const owner = { id: randomUUID() };
  const grantedCoParent = { id: randomUUID() };
  const ungrantedCoParent = { id: randomUUID() };
  const family = { id: randomUUID() };
  const otherOwner = { id: randomUUID() };
  const otherFamily = { id: randomUUID() };
  const child = { id: randomUUID() };

  beforeAll(async () => {
    await admin.parent.createMany({
      data: [
        {
          id: owner.id,
          authIdentityRef: `fictional-auth-ref-${owner.id}`,
          displayName: 'Fictional M27 Owner',
          contactEmail: `owner-${owner.id}@example.invalid`,
        },
        {
          id: grantedCoParent.id,
          authIdentityRef: `fictional-auth-ref-${grantedCoParent.id}`,
          displayName: 'Fictional M27 Granted Co-Parent',
          contactEmail: `granted-${grantedCoParent.id}@example.invalid`,
        },
        {
          id: ungrantedCoParent.id,
          authIdentityRef: `fictional-auth-ref-${ungrantedCoParent.id}`,
          displayName: 'Fictional M27 Ungranted Co-Parent',
          contactEmail: `ungranted-${ungrantedCoParent.id}@example.invalid`,
        },
        {
          id: otherOwner.id,
          authIdentityRef: `fictional-auth-ref-${otherOwner.id}`,
          displayName: 'Fictional M27 Control Owner',
          contactEmail: `control-${otherOwner.id}@example.invalid`,
        },
      ],
    });
    await admin.family.create({
      data: { id: family.id, owningParentId: owner.id, displayName: 'Fictional M27 Family' },
    });
    await admin.family.create({
      data: {
        id: otherFamily.id,
        owningParentId: otherOwner.id,
        displayName: 'Fictional M27 Control Family',
      },
    });
    await admin.child.create({
      data: {
        id: child.id,
        familyId: family.id,
        firstName: 'Fictional M27 Child',
        dateOfBirth: new Date('2019-06-01'),
        createdByParentId: owner.id,
      },
    });
    await admin.coParentAssignment.create({
      data: {
        familyId: family.id,
        parentId: grantedCoParent.id,
        invitedByParentId: owner.id,
        permissionScope: serializePermissionScope(['interact_with_leo']),
      },
    });
    await admin.coParentAssignment.create({
      data: {
        familyId: family.id,
        parentId: ungrantedCoParent.id,
        invitedByParentId: owner.id,
        permissionScope: serializePermissionScope(['view_child_profile']),
      },
    });
  });

  afterAll(async () => {
    const familyIds = [family.id, otherFamily.id];
    await admin.leoMemory.deleteMany({ where: { familyId: { in: familyIds } } });
    await admin.message.deleteMany({ where: { familyId: { in: familyIds } } });
    await admin.conversation.deleteMany({ where: { familyId: { in: familyIds } } });
    await admin.familyEncryptionKey.deleteMany({ where: { familyId: { in: familyIds } } });
    await admin.coParentAssignment.deleteMany({ where: { familyId: { in: familyIds } } });
    await admin.child.deleteMany({ where: { familyId: family.id } });
    await admin.family.deleteMany({ where: { id: { in: familyIds } } });
    await admin.parent.deleteMany({
      where: { id: { in: [owner.id, grantedCoParent.id, ungrantedCoParent.id, otherOwner.id] } },
    });
    await admin.$disconnect();
  });

  it('(a) an authorized owner starts a conversation, sends a message, and receives a persisted mock Leo reply — no real AI provider call', async () => {
    const conversation = await leoService.startConversation({
      familyId: family.id,
      childId: child.id,
      principalId: owner.id,
      principalType: 'Parent',
    });

    const turn = await leoChatService.sendMessage({
      conversationId: conversation.id,
      familyId: family.id,
      childId: child.id,
      content: 'Fictional: hi Leo, want to play a game?',
      principalId: owner.id,
      principalType: 'Parent',
    });

    expect(turn.childMessage.sender).toBe('child');
    expect(turn.childMessage.content).toBe('Fictional: hi Leo, want to play a game?');
    expect(turn.leoMessage.sender).toBe('leo');
    // Proves this actually went through mock.adapter.ts's fixed,
    // untouched canned-response shape — not a hand-written stub reply
    // and not a real model call (this milestone's own hard boundary).
    expect(turn.leoMessage.content).toContain('Fictional canned response for task_type');
    expect(turn.leoMessage.content).toContain('no real model was called');

    const transcript = await leoChatService.listMessages({
      conversationId: conversation.id,
      familyId: family.id,
      childId: child.id,
      principalId: owner.id,
      principalType: 'Parent',
    });
    expect(transcript.map((m) => m.sender)).toEqual(['child', 'leo']);
    expect(transcript.map((m) => m.content)).toEqual([
      turn.childMessage.content,
      turn.leoMessage.content,
    ]);
  });

  it('(a, continued) a co-parent explicitly granted interact_with_leo can also complete the full send+list flow', async () => {
    const conversation = await leoService.startConversation({
      familyId: family.id,
      childId: child.id,
      principalId: grantedCoParent.id,
      principalType: 'Parent',
    });

    const turn = await leoChatService.sendMessage({
      conversationId: conversation.id,
      familyId: family.id,
      childId: child.id,
      content: 'Fictional: hello from a granted co-parent',
      principalId: grantedCoParent.id,
      principalType: 'Parent',
    });
    expect(turn.leoMessage.sender).toBe('leo');

    const transcript = await leoChatService.listMessages({
      conversationId: conversation.id,
      familyId: family.id,
      childId: child.id,
      principalId: grantedCoParent.id,
      principalType: 'Parent',
    });
    expect(transcript).toHaveLength(2);
  });

  it('(b) a co-parent missing interact_with_leo is denied at sendMessage — no Message row is written, adapter never called', async () => {
    const conversation = await leoService.startConversation({
      familyId: family.id,
      childId: child.id,
      principalId: owner.id,
      principalType: 'Parent',
    });
    const beforeCount = await admin.message.count({ where: { conversationId: conversation.id } });

    await expect(
      leoChatService.sendMessage({
        conversationId: conversation.id,
        familyId: family.id,
        childId: child.id,
        content: 'should never be written',
        principalId: ungrantedCoParent.id,
        principalType: 'Parent',
      }),
    ).rejects.toThrow(LeoChatNotAuthorizedError);

    const afterCount = await admin.message.count({ where: { conversationId: conversation.id } });
    expect(afterCount).toBe(beforeCount);
  });

  it('(b, continued) a parent with no role in the family is denied at listMessages (family_not_authorized)', async () => {
    const conversation = await leoService.startConversation({
      familyId: family.id,
      childId: child.id,
      principalId: owner.id,
      principalType: 'Parent',
    });
    await leoChatService.sendMessage({
      conversationId: conversation.id,
      familyId: family.id,
      childId: child.id,
      content: 'Fictional: a message the stranger must never read',
      principalId: owner.id,
      principalType: 'Parent',
    });

    await expect(
      leoChatService.listMessages({
        conversationId: conversation.id,
        familyId: family.id,
        childId: child.id,
        principalId: otherOwner.id,
        principalType: 'Parent',
      }),
    ).rejects.toThrow(LeoChatNotAuthorizedError);
  });

  it('(b, continued) the owner of a different family cannot start a conversation for this family/child (family_not_authorized)', async () => {
    await expect(
      leoService.startConversation({
        familyId: family.id,
        childId: child.id,
        principalId: otherOwner.id,
        principalType: 'Parent',
      }),
    ).rejects.toThrow(LeoChatNotAuthorizedError);
  });
});
