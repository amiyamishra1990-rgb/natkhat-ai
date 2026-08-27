import { randomUUID, randomBytes } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { FamilyEncryptionKeyRepository } from './repositories/family-encryption-key.repository';
import { ConversationRepository } from './repositories/conversation.repository';
import { MessageRepository } from './repositories/message.repository';
import { LeoMemoryRepository } from './repositories/leo-memory.repository';
import { LeoEncryptionService } from './leo-encryption.service';
import { LeoConversationNotFoundError, LeoMemoryNotFoundError, LeoService } from './leo.service';
import { FamilyRepository } from '../identity-family/repositories/family.repository';
import { CoParentAssignmentRepository } from '../identity-family/repositories/co-parent-assignment.repository';
import { AuthorizationService } from '../authorization/authorization.service';

// M18 — the milestone's own Definition of Done: "A Leo session scoped
// to one Child cannot read another Child's rows in the same Family,
// proven by test" (docs/sprints/sprint-03.md, §4). This is
// specifically an APPLICATION-layer boundary, not RLS — §7.4/§7.6 are
// explicit that no child-scoped session claim exists in the current
// M1/M2 model, so this test exercises LeoService directly (both
// Children below share the SAME family_id, so RLS's family_id
// predicate alone would incorrectly admit both — proving this
// boundary requires going through LeoService, not withRlsContext).
describe('Leo cross-child application-layer isolation (M18, §7.4/§7.6)', () => {
  const admin = new PrismaClient();
  const testKek = randomBytes(32).toString('base64');

  const leoService = new LeoService(
    admin,
    new LeoEncryptionService(
      { memoryKek: Buffer.from(testKek, 'base64'), versionHistoryRetentionDays: 90 },
      new FamilyEncryptionKeyRepository(admin),
    ),
    new ConversationRepository(admin),
    new MessageRepository(admin),
    new LeoMemoryRepository(admin),
    new AuthorizationService(new FamilyRepository(admin), new CoParentAssignmentRepository(admin)),
  );

  const owner = { id: randomUUID() };
  const family = { id: randomUUID() };
  const childA = { id: randomUUID() };
  const childB = { id: randomUUID() };

  beforeAll(async () => {
    await admin.parent.create({
      data: {
        id: owner.id,
        authIdentityRef: `fictional-auth-ref-${owner.id}`,
        displayName: 'Fictional Owner',
        contactEmail: `owner-${owner.id}@example.invalid`,
      },
    });
    await admin.family.create({
      data: { id: family.id, owningParentId: owner.id, displayName: 'Fictional Shared Family' },
    });
    // Both children belong to the SAME Family — this is the whole
    // point: family_id alone (RLS's boundary) cannot distinguish them.
    await admin.child.create({
      data: {
        id: childA.id,
        familyId: family.id,
        firstName: 'Fictional Child A',
        dateOfBirth: new Date('2018-01-01'),
        createdByParentId: owner.id,
      },
    });
    await admin.child.create({
      data: {
        id: childB.id,
        familyId: family.id,
        firstName: 'Fictional Child B',
        dateOfBirth: new Date('2020-01-01'),
        createdByParentId: owner.id,
      },
    });
  });

  afterAll(async () => {
    await admin.leoMemory.deleteMany({ where: { familyId: family.id } });
    await admin.message.deleteMany({ where: { familyId: family.id } });
    await admin.conversation.deleteMany({ where: { familyId: family.id } });
    await admin.familyEncryptionKey.deleteMany({ where: { familyId: family.id } });
    await admin.child.deleteMany({ where: { familyId: family.id } });
    await admin.family.deleteMany({ where: { id: family.id } });
    await admin.parent.deleteMany({ where: { id: owner.id } });
    await admin.$disconnect();
  });

  it("a Leo session scoped to Child A cannot read Child B's Conversation, even though both share family_id", async () => {
    const conversationB = await leoService.startConversation({
      familyId: family.id,
      childId: childB.id,
      principalId: owner.id,
      principalType: 'Parent',
    });
    await leoService.appendMessage({
      conversationId: conversationB.id,
      familyId: family.id,
      childId: childB.id,
      sender: 'child',
      content: 'Fictional: this belongs to Child B only.',
      principalId: owner.id,
      principalType: 'Parent',
    });

    // Same family_id, wrong childId — must be refused, not silently
    // scoped down or partially returned. owner.id is authorized for
    // `family` regardless of which child is named, so this exercises
    // the cross-child application-layer scoping specifically, not the
    // M23 authorization gate (which passes here).
    await expect(
      leoService.appendMessage({
        conversationId: conversationB.id,
        familyId: family.id,
        childId: childA.id,
        sender: 'child',
        content: 'should never be written under Child A',
        principalId: owner.id,
        principalType: 'Parent',
      }),
    ).rejects.toThrow(LeoConversationNotFoundError);

    await expect(
      leoService.listMessages({
        conversationId: conversationB.id,
        familyId: family.id,
        childId: childA.id,
      }),
    ).resolves.toEqual([]);
  });

  it("a Leo session scoped to Child A cannot read, correct, or vault Child B's LeoMemory", async () => {
    const memoryB = await leoService.addMemory({
      familyId: family.id,
      childId: childB.id,
      content: 'Fictional memory belonging only to Child B.',
    });

    await expect(
      leoService.correctMemory({
        memoryId: memoryB.id,
        familyId: family.id,
        childId: childA.id,
        newContent: 'attempted cross-child correction',
      }),
    ).rejects.toThrow(LeoMemoryNotFoundError);

    await expect(
      leoService.addToVault({
        memoryId: memoryB.id,
        familyId: family.id,
        childId: childA.id,
        actingParentId: owner.id,
      }),
    ).rejects.toThrow(LeoMemoryNotFoundError);

    // Child B's own memory is untouched and still exactly Class 1 —
    // the rejected cross-child attempts had zero effect.
    const memoryBAfter = await admin.leoMemory.findUnique({ where: { id: memoryB.id } });
    expect(memoryBAfter?.memoryClass).toBe('active_relationship');

    const childAMemories = await leoService.listActiveMemories({
      familyId: family.id,
      childId: childA.id,
    });
    expect(childAMemories).toEqual([]);

    const childBMemories = await leoService.listActiveMemories({
      familyId: family.id,
      childId: childB.id,
    });
    expect(childBMemories.map((m) => m.id)).toEqual([memoryB.id]);
  });
});
