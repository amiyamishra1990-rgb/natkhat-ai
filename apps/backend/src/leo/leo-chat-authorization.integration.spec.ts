import { randomUUID, randomBytes } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { FamilyEncryptionKeyRepository } from './repositories/family-encryption-key.repository';
import { ConversationRepository } from './repositories/conversation.repository';
import { MessageRepository } from './repositories/message.repository';
import { LeoMemoryRepository } from './repositories/leo-memory.repository';
import { LeoEncryptionService } from './leo-encryption.service';
import { LeoChatNotAuthorizedError, LeoService } from './leo.service';
import { FamilyRepository } from '../identity-family/repositories/family.repository';
import { CoParentAssignmentRepository } from '../identity-family/repositories/co-parent-assignment.repository';
import { AuthorizationService } from '../authorization/authorization.service';
import { serializePermissionScope } from '../authorization/permission-scope';

// M23 — Leo-Chat Authorization Gap (docs/sprints/sprint-04.md, §4;
// docs/decisions/decision-log.md, 2026-08-22 entry, closed by this
// milestone's own entry). Requires a real, live PostgreSQL instance
// with the M14 migration applied — same "security-sensitive behavior
// needs real infrastructure, not just mocks" discipline as
// authorization/authorization.integration.spec.ts and
// leo/leo.service.integration.spec.ts, not a mocked
// AuthorizationService: this proves the M15 two-gate check actually
// denies/permits `LeoService.startConversation`/`appendMessage`
// end-to-end against real Family/CoParentAssignment rows, not that a
// mock was configured correctly.
describe('LeoService — M23 interact_with_leo authorization gate', () => {
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

  const owner = { id: randomUUID() };
  const grantedCoParent = { id: randomUUID() };
  const ungrantedCoParent = { id: randomUUID() };
  const strangerParent = { id: randomUUID() };
  const family = { id: randomUUID() };
  const child = { id: randomUUID() };

  beforeAll(async () => {
    await admin.parent.createMany({
      data: [
        {
          id: owner.id,
          authIdentityRef: `fictional-auth-ref-${owner.id}`,
          displayName: 'Fictional M23 Owner',
          contactEmail: `owner-${owner.id}@example.invalid`,
        },
        {
          id: grantedCoParent.id,
          authIdentityRef: `fictional-auth-ref-${grantedCoParent.id}`,
          displayName: 'Fictional M23 Granted Co-Parent',
          contactEmail: `granted-co-parent-${grantedCoParent.id}@example.invalid`,
        },
        {
          id: ungrantedCoParent.id,
          authIdentityRef: `fictional-auth-ref-${ungrantedCoParent.id}`,
          displayName: 'Fictional M23 Ungranted Co-Parent',
          contactEmail: `ungranted-co-parent-${ungrantedCoParent.id}@example.invalid`,
        },
        {
          id: strangerParent.id,
          authIdentityRef: `fictional-auth-ref-${strangerParent.id}`,
          displayName: 'Fictional M23 Stranger Parent',
          contactEmail: `stranger-${strangerParent.id}@example.invalid`,
        },
      ],
    });
    await admin.family.create({
      data: { id: family.id, owningParentId: owner.id, displayName: 'Fictional M23 Family' },
    });
    await admin.child.create({
      data: {
        id: child.id,
        familyId: family.id,
        firstName: 'Fictional M23 Child',
        dateOfBirth: new Date('2019-06-01'),
        createdByParentId: owner.id,
      },
    });
    await admin.coParentAssignment.create({
      data: {
        familyId: family.id,
        parentId: grantedCoParent.id,
        invitedByParentId: owner.id,
        // Deliberately includes another co-parent-eligible action too,
        // to prove the check is action-specific, not "any grant at all".
        permissionScope: serializePermissionScope(['view_child_profile', 'interact_with_leo']),
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
    await admin.leoMemory.deleteMany({ where: { familyId: family.id } });
    await admin.message.deleteMany({ where: { familyId: family.id } });
    await admin.conversation.deleteMany({ where: { familyId: family.id } });
    await admin.familyEncryptionKey.deleteMany({ where: { familyId: family.id } });
    await admin.coParentAssignment.deleteMany({ where: { familyId: family.id } });
    await admin.child.deleteMany({ where: { familyId: family.id } });
    await admin.family.deleteMany({ where: { id: family.id } });
    await admin.parent.deleteMany({
      where: {
        id: { in: [owner.id, grantedCoParent.id, ungrantedCoParent.id, strangerParent.id] },
      },
    });
    await admin.$disconnect();
  });

  it("the owning parent is allowed to start and continue a conversation for their own family's child", async () => {
    const conversation = await leoService.startConversation({
      familyId: family.id,
      childId: child.id,
      principalId: owner.id,
      principalType: 'Parent',
    });
    expect(conversation.id).toEqual(expect.any(String));

    const message = await leoService.appendMessage({
      conversationId: conversation.id,
      familyId: family.id,
      childId: child.id,
      sender: 'child',
      content: 'Fictional: hi Leo!',
      principalId: owner.id,
      principalType: 'Parent',
    });
    expect(message.content).toBe('Fictional: hi Leo!');
  });

  it('a co-parent explicitly granted interact_with_leo is allowed', async () => {
    const conversation = await leoService.startConversation({
      familyId: family.id,
      childId: child.id,
      principalId: grantedCoParent.id,
      principalType: 'Parent',
    });
    expect(conversation.id).toEqual(expect.any(String));
  });

  it('a co-parent whose permission_scope does NOT include interact_with_leo is denied (action_not_permitted gate) — no Conversation row is created', async () => {
    const beforeCount = await admin.conversation.count({ where: { familyId: family.id } });

    await expect(
      leoService.startConversation({
        familyId: family.id,
        childId: child.id,
        principalId: ungrantedCoParent.id,
        principalType: 'Parent',
      }),
    ).rejects.toThrow(LeoChatNotAuthorizedError);

    const afterCount = await admin.conversation.count({ where: { familyId: family.id } });
    expect(afterCount).toBe(beforeCount);
  });

  it('a parent with no role at all in the family is denied (family_not_authorized gate)', async () => {
    await expect(
      leoService.startConversation({
        familyId: family.id,
        childId: child.id,
        principalId: strangerParent.id,
        principalType: 'Parent',
      }),
    ).rejects.toThrow(LeoChatNotAuthorizedError);
  });

  it('appendMessage is independently gated too — an ungranted co-parent cannot append to an existing conversation, and no Message row is written', async () => {
    const conversation = await leoService.startConversation({
      familyId: family.id,
      childId: child.id,
      principalId: owner.id,
      principalType: 'Parent',
    });
    const beforeCount = await admin.message.count({ where: { conversationId: conversation.id } });

    await expect(
      leoService.appendMessage({
        conversationId: conversation.id,
        familyId: family.id,
        childId: child.id,
        sender: 'child',
        content: 'should never be written',
        principalId: ungrantedCoParent.id,
        principalType: 'Parent',
      }),
    ).rejects.toThrow(LeoChatNotAuthorizedError);

    const afterCount = await admin.message.count({ where: { conversationId: conversation.id } });
    expect(afterCount).toBe(beforeCount);
  });

  it('a revoked co-parent assignment is re-resolved live — access denied immediately after revocation (ADR-0009 Decision item 6, same discipline as M15)', async () => {
    const conversation = await leoService.startConversation({
      familyId: family.id,
      childId: child.id,
      principalId: grantedCoParent.id,
      principalType: 'Parent',
    });
    expect(conversation.id).toEqual(expect.any(String));

    await admin.coParentAssignment.updateMany({
      where: { familyId: family.id, parentId: grantedCoParent.id },
      data: { status: 'revoked' },
    });

    await expect(
      leoService.startConversation({
        familyId: family.id,
        childId: child.id,
        principalId: grantedCoParent.id,
        principalType: 'Parent',
      }),
    ).rejects.toThrow(LeoChatNotAuthorizedError);

    // Restore, so this test's ordering relative to any later spec in
    // the same run cannot leave the fixture in a surprising state.
    await admin.coParentAssignment.updateMany({
      where: { familyId: family.id, parentId: grantedCoParent.id },
      data: { status: 'active' },
    });
  });
});
