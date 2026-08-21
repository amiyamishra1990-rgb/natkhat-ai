import { randomUUID, randomBytes } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { FamilyEncryptionKeyRepository } from './repositories/family-encryption-key.repository';
import { ConversationRepository } from './repositories/conversation.repository';
import { MessageRepository } from './repositories/message.repository';
import { LeoMemoryRepository } from './repositories/leo-memory.repository';
import { LeoEncryptionService } from './leo-encryption.service';
import { LeoService, LeoVaultOwnerOnlyError } from './leo.service';

// M18 — Integration (docs/sprints/sprint-03.md, §4; ADR-0012;
// ai-memory-isolation.md §5.1, §6.3). Same live-Postgres pattern as
// consent.service.integration.spec.ts: admin/migration client only.
// Fixtures reuse M17's convention of creating a fictional Child
// directly (this milestone's own scope note: "fixtures use M17's
// consent-scaffold Child rows" — the Child row itself, not a live
// ConsentService call, is what matters for these tests).
describe('LeoService — M18', () => {
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
  );

  const owner = { id: randomUUID() };
  const nonOwnerParent = { id: randomUUID() };
  const family = { id: randomUUID() };
  const child = { id: randomUUID() };
  const otherFamily = { id: randomUUID() };
  const otherChild = { id: randomUUID() };

  beforeAll(async () => {
    await admin.parent.create({
      data: {
        id: owner.id,
        authIdentityRef: `fictional-auth-ref-${owner.id}`,
        displayName: 'Fictional Owner',
        contactEmail: `owner-${owner.id}@example.invalid`,
      },
    });
    await admin.parent.create({
      data: {
        id: nonOwnerParent.id,
        authIdentityRef: `fictional-auth-ref-${nonOwnerParent.id}`,
        displayName: 'Fictional Non-Owner Parent',
        contactEmail: `non-owner-${nonOwnerParent.id}@example.invalid`,
      },
    });
    await admin.family.create({
      data: { id: family.id, owningParentId: owner.id, displayName: 'Fictional Family' },
    });
    await admin.family.create({
      data: { id: otherFamily.id, owningParentId: owner.id, displayName: 'Fictional Other Family' },
    });
    await admin.child.create({
      data: {
        id: child.id,
        familyId: family.id,
        firstName: 'Fictional Child',
        dateOfBirth: new Date('2019-06-01'),
        createdByParentId: owner.id,
      },
    });
    await admin.child.create({
      data: {
        id: otherChild.id,
        familyId: otherFamily.id,
        firstName: 'Fictional Other Child',
        dateOfBirth: new Date('2019-06-01'),
        createdByParentId: owner.id,
      },
    });
  });

  afterAll(async () => {
    await admin.leoMemory.deleteMany({ where: { familyId: { in: [family.id, otherFamily.id] } } });
    await admin.message.deleteMany({ where: { familyId: { in: [family.id, otherFamily.id] } } });
    await admin.conversation.deleteMany({
      where: { familyId: { in: [family.id, otherFamily.id] } },
    });
    await admin.familyEncryptionKey.deleteMany({
      where: { familyId: { in: [family.id, otherFamily.id] } },
    });
    await admin.child.deleteMany({ where: { familyId: { in: [family.id, otherFamily.id] } } });
    await admin.family.deleteMany({ where: { id: { in: [family.id, otherFamily.id] } } });
    await admin.parent.deleteMany({ where: { id: { in: [owner.id, nonOwnerParent.id] } } });
    await admin.$disconnect();
  });

  it('startConversation + appendMessage + listMessages round-trips real plaintext through encrypted storage', async () => {
    const conversation = await leoService.startConversation({
      familyId: family.id,
      childId: child.id,
    });

    const sent = await leoService.appendMessage({
      conversationId: conversation.id,
      familyId: family.id,
      childId: child.id,
      sender: 'child',
      content: 'Fictional: I saw a dinosaur at the museum today!',
    });
    expect(sent.content).toBe('Fictional: I saw a dinosaur at the museum today!');

    const storedMessage = await admin.message.findUnique({ where: { id: sent.id } });
    expect(Buffer.from(storedMessage!.content).toString('utf8')).not.toContain('dinosaur');

    const messages = await leoService.listMessages({
      conversationId: conversation.id,
      familyId: family.id,
      childId: child.id,
    });
    expect(messages).toHaveLength(1);
    expect(messages[0]?.content).toBe('Fictional: I saw a dinosaur at the museum today!');

    const updatedConversation = await admin.conversation.findUnique({
      where: { id: conversation.id },
    });
    expect(updatedConversation?.lastMessageAt.getTime()).toBe(sent.createdAt.getTime());
  });

  it('appendMessage refuses a conversationId that does not belong to the given (familyId, childId)', async () => {
    const conversation = await leoService.startConversation({
      familyId: family.id,
      childId: child.id,
    });

    await expect(
      leoService.appendMessage({
        conversationId: conversation.id,
        familyId: otherFamily.id,
        childId: otherChild.id,
        sender: 'child',
        content: 'should never be written',
      }),
    ).rejects.toThrow();
  });

  it("addMemory creates a Class 1 (active_relationship) row; correctMemory supersedes it without mutating the prior row's content (§5.1)", async () => {
    const original = await leoService.addMemory({
      familyId: family.id,
      childId: child.id,
      content: 'Fictional: favorite color is green.',
    });
    expect(original.memoryClass).toBe('active_relationship');

    const corrected = await leoService.correctMemory({
      memoryId: original.id,
      familyId: family.id,
      childId: child.id,
      newContent: 'Fictional: favorite color is actually blue.',
    });
    expect(corrected.memoryClass).toBe('active_relationship');
    expect(corrected.supersedesMemoryId).toBe(original.id);
    expect(corrected.id).not.toBe(original.id);

    const priorRowAfter = await admin.leoMemory.findUnique({ where: { id: original.id } });
    expect(priorRowAfter?.memoryClass).toBe('version_history');
    // The prior row's content ciphertext is byte-for-byte unchanged —
    // proving this was a field reassignment, not a content rewrite.
    const decryptedPriorContent = await new LeoEncryptionService(
      { memoryKek: Buffer.from(testKek, 'base64'), versionHistoryRetentionDays: 90 },
      new FamilyEncryptionKeyRepository(admin),
    ).decryptContent(family.id, priorRowAfter!.content);
    expect(decryptedPriorContent).toBe('Fictional: favorite color is green.');

    const active = await leoService.listActiveMemories({ familyId: family.id, childId: child.id });
    expect(active.map((m) => m.memoryClass).sort()).toEqual(
      ['active_relationship', 'version_history'].sort(),
    );
  });

  it("addToVault succeeds for the Family's owning parent and fails for a non-owner (§6.3, owner-only unconditional)", async () => {
    const memory = await leoService.addMemory({
      familyId: family.id,
      childId: child.id,
      content: 'Fictional: first day of kindergarten.',
    });

    await expect(
      leoService.addToVault({
        memoryId: memory.id,
        familyId: family.id,
        childId: child.id,
        actingParentId: nonOwnerParent.id,
      }),
    ).rejects.toThrow(LeoVaultOwnerOnlyError);

    const vaulted = await leoService.addToVault({
      memoryId: memory.id,
      familyId: family.id,
      childId: child.id,
      actingParentId: owner.id,
    });
    expect(vaulted.memoryClass).toBe('permanent_vault');
    expect(vaulted.vaultedFromMemoryId).toBe(memory.id);
    expect(vaulted.vaultedByParentId).toBe(owner.id);
    expect(vaulted.content).toBe('Fictional: first day of kindergarten.');
    expect(vaulted.vaultedAt).not.toBeNull();
  });
});
