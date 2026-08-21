import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { ChildRepository } from '../identity-family/repositories/child.repository';
import { FamilyRepository } from '../identity-family/repositories/family.repository';
import { ParentRepository } from '../identity-family/repositories/parent.repository';
import { CoParentAssignmentRepository } from '../identity-family/repositories/co-parent-assignment.repository';
import { DeviceRepository } from '../identity-family/repositories/device.repository';
import { SessionRepository } from '../identity-family/repositories/session.repository';
import { AuditEventRepository } from '../audit/repositories/audit-event.repository';
import { AuditService } from '../audit/audit.service';
import { serializePermissionScope } from '../authorization/permission-scope';
import { ConversationRepository } from '../leo/repositories/conversation.repository';
import { MessageRepository } from '../leo/repositories/message.repository';
import { LeoMemoryRepository } from '../leo/repositories/leo-memory.repository';
import { FamilyEncryptionKeyRepository } from '../leo/repositories/family-encryption-key.repository';
import { LeoLifecycleService } from '../leo/leo-lifecycle.service';
import { LifecycleService } from './lifecycle.service';

// M16 — Integration (docs/sprints/sprint-03.md, §4; ADR-0015 §7, §12,
// §13.1). Same live-Postgres pattern as
// authorization.integration.spec.ts: admin/migration client only.
describe('LifecycleService — M16', () => {
  const admin = new PrismaClient();
  const childRepository = new ChildRepository(admin);
  const familyRepository = new FamilyRepository(admin);
  const parentRepository = new ParentRepository(admin);
  const coParentAssignmentRepository = new CoParentAssignmentRepository(admin);
  const deviceRepository = new DeviceRepository(admin);
  const sessionRepository = new SessionRepository(admin);
  const auditEventRepository = new AuditEventRepository(admin);
  const auditService = new AuditService(auditEventRepository, { tier5RetentionYears: 3 });
  const leoLifecycleService = new LeoLifecycleService(
    { memoryKek: null, versionHistoryRetentionDays: 90 },
    new ConversationRepository(admin),
    new MessageRepository(admin),
    new LeoMemoryRepository(admin),
    new FamilyEncryptionKeyRepository(admin),
  );
  const lifecycleService = new LifecycleService(
    childRepository,
    familyRepository,
    parentRepository,
    coParentAssignmentRepository,
    deviceRepository,
    sessionRepository,
    auditService,
    leoLifecycleService,
    { softToHardDeleteDays: 90, backupPurgeDays: 90 },
  );

  const owner = { id: randomUUID() };
  const coParent = { id: randomUUID() };
  const family = { id: randomUUID() };
  const coParentOwnFamily = { id: randomUUID() };
  const childOne = { id: randomUUID() };
  const childTwo = { id: randomUUID() };
  const ownerDevice = { id: randomUUID() };
  const coParentDevice = { id: randomUUID() };
  let assignmentId: string;
  let childTwoConversationId: string;
  let childTwoMessageId: string;
  let childTwoMemoryId: string;
  let childOneConversationId: string;
  let childOneMessageId: string;
  let childOneMemoryId: string;
  let versionHistoryMemoryId: string;

  const allParentIds = () => [owner.id, coParent.id];
  const allFamilyIds = () => [family.id, coParentOwnFamily.id];

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
        id: coParent.id,
        authIdentityRef: `fictional-auth-ref-${coParent.id}`,
        displayName: 'Fictional Co-Parent',
        contactEmail: `co-parent-${coParent.id}@example.invalid`,
      },
    });
    await admin.family.create({
      data: { id: family.id, owningParentId: owner.id, displayName: 'Fictional Family' },
    });
    await admin.family.create({
      data: {
        id: coParentOwnFamily.id,
        owningParentId: coParent.id,
        displayName: "Fictional Co-Parent's Own Family",
      },
    });
    await admin.child.create({
      data: {
        id: childOne.id,
        familyId: family.id,
        firstName: 'Fictional Child One',
        dateOfBirth: new Date('2019-06-01'),
        createdByParentId: owner.id,
      },
    });
    await admin.child.create({
      data: {
        id: childTwo.id,
        familyId: family.id,
        firstName: 'Fictional Child Two',
        dateOfBirth: new Date('2020-09-01'),
        createdByParentId: owner.id,
      },
    });
    const assignment = await admin.coParentAssignment.create({
      data: {
        familyId: family.id,
        parentId: coParent.id,
        invitedByParentId: owner.id,
        permissionScope: serializePermissionScope(['view_child_profile']),
      },
    });
    assignmentId = assignment.id;
    await admin.device.create({
      data: {
        id: ownerDevice.id,
        parentId: owner.id,
        deviceLabel: "Owner's fictional tablet",
        deviceType: 'tablet',
        status: 'active',
      },
    });
    await admin.device.create({
      data: {
        id: coParentDevice.id,
        parentId: coParent.id,
        deviceLabel: "Co-Parent's fictional phone",
        deviceType: 'phone',
        status: 'active',
      },
    });

    // M18 fixtures — inserted directly via the admin client (this is a
    // LifecycleService test; it exercises the cascade at the
    // repository/DB level, the same convention this file already
    // follows for Child/CoParentAssignment/Session, not a LeoService
    // round-trip). `content` is fictional ciphertext-shaped bytes, not
    // real encrypted content — this file never touches
    // LeoEncryptionService.
    const childTwoConversation = await admin.conversation.create({
      data: { familyId: family.id, childId: childTwo.id },
    });
    childTwoConversationId = childTwoConversation.id;
    const childTwoMessage = await admin.message.create({
      data: {
        conversationId: childTwoConversationId,
        familyId: family.id,
        childId: childTwo.id,
        sender: 'child',
        content: Buffer.from('fictional-ciphertext-child-two'),
      },
    });
    childTwoMessageId = childTwoMessage.id;
    const childTwoMemory = await admin.leoMemory.create({
      data: {
        familyId: family.id,
        childId: childTwo.id,
        memoryClass: 'active_relationship',
        content: Buffer.from('fictional-memory-ciphertext-child-two'),
      },
    });
    childTwoMemoryId = childTwoMemory.id;

    const childOneConversation = await admin.conversation.create({
      data: { familyId: family.id, childId: childOne.id },
    });
    childOneConversationId = childOneConversation.id;
    const childOneMessage = await admin.message.create({
      data: {
        conversationId: childOneConversationId,
        familyId: family.id,
        childId: childOne.id,
        sender: 'child',
        content: Buffer.from('fictional-ciphertext-child-one'),
      },
    });
    childOneMessageId = childOneMessage.id;
    const childOneMemory = await admin.leoMemory.create({
      data: {
        familyId: family.id,
        childId: childOne.id,
        memoryClass: 'active_relationship',
        content: Buffer.from('fictional-memory-ciphertext-child-one'),
      },
    });
    childOneMemoryId = childOneMemory.id;

    // §5.4 — a version_history row, backdated past the
    // configured 90-day version-history retention window so
    // runHardDeleteSweep's independent expiry sweep has something
    // eligible to find, distinct from the generic soft-delete cascade
    // above (this row is never soft-deleted by any cascade — it ages
    // out purely from its own createdAt).
    const versionHistoryMemory = await admin.leoMemory.create({
      data: {
        familyId: family.id,
        childId: childOne.id,
        memoryClass: 'version_history',
        content: Buffer.from('fictional-aged-out-version-history-ciphertext'),
        createdAt: new Date(Date.now() - 91 * 24 * 60 * 60 * 1000),
      },
    });
    versionHistoryMemoryId = versionHistoryMemory.id;

    // A FamilyEncryptionKey row for `family` — no real KEK is
    // configured in this test file (leoLifecycleService above is
    // constructed with memoryKek: null), so this is a fictional
    // wrapped-DEK blob inserted directly, existing solely to prove
    // runHardDeleteSweep's crypto-shredding step (§7.5) deletes it
    // when `family` itself completes hard-delete.
    await admin.familyEncryptionKey.create({
      data: { familyId: family.id, wrappedDek: Buffer.from('fictional-wrapped-dek') },
    });
  });

  afterAll(async () => {
    await admin.leoMemory.deleteMany({ where: { familyId: { in: allFamilyIds() } } });
    await admin.message.deleteMany({ where: { familyId: { in: allFamilyIds() } } });
    await admin.conversation.deleteMany({ where: { familyId: { in: allFamilyIds() } } });
    await admin.familyEncryptionKey.deleteMany({ where: { familyId: { in: allFamilyIds() } } });
    await admin.auditEvent.deleteMany({ where: { familyId: { in: allFamilyIds() } } });
    await admin.auditEvent.deleteMany({ where: { actorPrincipalId: { in: allParentIds() } } });
    await admin.session.deleteMany({ where: { familyId: { in: allFamilyIds() } } });
    await admin.device.deleteMany({ where: { parentId: { in: allParentIds() } } });
    await admin.coParentAssignment.deleteMany({ where: { familyId: { in: allFamilyIds() } } });
    await admin.child.deleteMany({ where: { familyId: { in: allFamilyIds() } } });
    await admin.family.deleteMany({ where: { id: { in: allFamilyIds() } } });
    await admin.parent.deleteMany({ where: { id: { in: allParentIds() } } });
    await admin.$disconnect();
  });

  it('softDeleteChild (§7.1) soft-deletes only the one Child and records child_deleted', async () => {
    const child = await lifecycleService.softDeleteChild({
      childId: childTwo.id,
      actorParentId: owner.id,
      actorRole: 'owner',
    });
    expect(child.status).toBe('deleted');
    expect(child.deletedAt).not.toBeNull();

    const untouchedSibling = await admin.child.findUnique({ where: { id: childOne.id } });
    expect(untouchedSibling?.status).toBe('active');

    const events = await admin.auditEvent.findMany({
      where: { eventType: 'child_deleted', targetId: childTwo.id },
    });
    expect(events).toHaveLength(1);
    expect(events[0]?.familyId).toBe(family.id);
    expect(events[0]?.actorRoleAtTime).toBe('owner');

    // M18, ai-memory-isolation.md §5.3 — softDeleteChild's cascade
    // reaches Conversation/Message/LeoMemory for that Child.
    const cascadedConversation = await admin.conversation.findUnique({
      where: { id: childTwoConversationId },
    });
    const cascadedMessage = await admin.message.findUnique({ where: { id: childTwoMessageId } });
    const cascadedMemory = await admin.leoMemory.findUnique({ where: { id: childTwoMemoryId } });
    expect(cascadedConversation?.status).toBe('deleted');
    expect(cascadedConversation?.deletedAt).not.toBeNull();
    expect(cascadedMessage?.status).toBe('deleted');
    expect(cascadedMemory?.status).toBe('deleted');

    // childOne's own Leo rows are untouched — the cascade is scoped to
    // childTwo only, same isolation this test's sibling-Child
    // assertion above already proves at the Child-row level.
    const untouchedConversation = await admin.conversation.findUnique({
      where: { id: childOneConversationId },
    });
    expect(untouchedConversation?.status).toBe('active');
  });

  it('softDeleteFamily (§7.2) cascades to remaining active Children, active CoParentAssignments, and pinned Sessions, and does not touch Device', async () => {
    const ownerSession = await sessionRepository.create({
      principalId: owner.id,
      principalType: 'Parent',
      familyId: family.id,
      deviceId: ownerDevice.id,
    });
    const coParentSession = await sessionRepository.create({
      principalId: coParent.id,
      principalType: 'Parent',
      familyId: family.id,
      deviceId: coParentDevice.id,
    });

    const result = await lifecycleService.softDeleteFamily({
      familyId: family.id,
      actorParentId: owner.id,
      actorRole: 'owner',
    });

    expect(result.childrenSoftDeleted).toBe(1); // only childOne was still active
    expect(result.coParentAssignmentsRevoked).toBe(1);
    expect(result.sessionsEnded).toBe(2);

    const deletedFamily = await admin.family.findUnique({ where: { id: family.id } });
    expect(deletedFamily?.status).toBe('deleted');
    expect(deletedFamily?.deletedAt).not.toBeNull();

    const cascadedChild = await admin.child.findUnique({ where: { id: childOne.id } });
    expect(cascadedChild?.status).toBe('deleted');

    const revokedAssignment = await admin.coParentAssignment.findUnique({
      where: { id: assignmentId },
    });
    expect(revokedAssignment?.status).toBe('revoked');

    const endedOwnerSession = await admin.session.findUnique({ where: { id: ownerSession.id } });
    const endedCoParentSession = await admin.session.findUnique({
      where: { id: coParentSession.id },
    });
    expect(endedOwnerSession?.endedAt).not.toBeNull();
    expect(endedOwnerSession?.endReason).toBe('family_deleted');
    expect(endedCoParentSession?.endedAt).not.toBeNull();

    // §7.2's explicit carve-out: Device is Parent-scoped, untouched by
    // a Family deletion.
    const untouchedDevice = await admin.device.findUnique({ where: { id: ownerDevice.id } });
    expect(untouchedDevice?.status).toBe('active');

    const events = await admin.auditEvent.findMany({
      where: { eventType: 'family_deleted', targetId: family.id },
    });
    expect(events).toHaveLength(1);
    // childTwo's Leo rows were already soft-deleted by the prior
    // test's per-child cascade — this family-wide cascade catches only
    // childOne's still-active Conversation/Message/LeoMemory (1 each),
    // plus the still-active version_history row created in beforeAll
    // (also family-scoped, so it counts as a fourth LeoMemory row).
    expect(events[0]?.metadata).toEqual({
      childrenSoftDeleted: 1,
      coParentAssignmentsRevoked: 1,
      sessionsEnded: 2,
      leoConversationsSoftDeleted: 1,
      leoMessagesSoftDeleted: 1,
      leoMemoriesSoftDeleted: 2,
    });

    // No redundant per-child child_deleted event for the cascaded
    // child, beyond the one already asserted for childTwo above.
    const childDeletedEvents = await admin.auditEvent.findMany({
      where: { eventType: 'child_deleted' },
    });
    expect(childDeletedEvents).toHaveLength(1);

    // M18 — the family-wide cascade reaches childOne's Conversation/
    // Message/LeoMemory too (childTwo's were already soft-deleted by
    // the previous test's per-child cascade, not re-touched here).
    const childOneConversationAfter = await admin.conversation.findUnique({
      where: { id: childOneConversationId },
    });
    const childOneMessageAfter = await admin.message.findUnique({
      where: { id: childOneMessageId },
    });
    const childOneMemoryAfter = await admin.leoMemory.findUnique({
      where: { id: childOneMemoryId },
    });
    const versionHistoryMemoryAfter = await admin.leoMemory.findUnique({
      where: { id: versionHistoryMemoryId },
    });
    expect(childOneConversationAfter?.status).toBe('deleted');
    expect(childOneMessageAfter?.status).toBe('deleted');
    expect(childOneMemoryAfter?.status).toBe('deleted');
    expect(versionHistoryMemoryAfter?.status).toBe('deleted');
  });

  it('softDeleteAccount (§7.3) distinguishes owned Families (cascaded) from co-parent Families (assignment revoked only), and ends the account', async () => {
    const coParentOwnSession = await sessionRepository.create({
      principalId: coParent.id,
      principalType: 'Parent',
      familyId: coParentOwnFamily.id,
      deviceId: coParentDevice.id,
    });
    // A leftover active session not pinned to any family this cascade's
    // per-family steps would otherwise touch (family's own
    // co-parent-assignment cascade already ran in the prior test) —
    // exercises the final "end this Parent's own remaining Sessions
    // across every Family" safety-net step (§7.3) specifically.
    const staleSession = await sessionRepository.create({
      principalId: coParent.id,
      principalType: 'Parent',
      familyId: family.id,
      deviceId: coParentDevice.id,
    });

    const result = await lifecycleService.softDeleteAccount({ parentId: coParent.id });

    expect(result.ownedFamiliesDeleted).toBe(1); // coParentOwnFamily, cascaded exactly like softDeleteFamily
    expect(result.coParentAssignmentsRevoked).toBe(0); // already revoked by the prior test's family-delete cascade
    expect(result.devicesRemoved).toBe(1);
    // coParentOwnSession is already ended by step 1's own-family
    // cascade (endReason family_deleted, asserted below) before step 4
    // runs — only the stale leftover session is left for step 4 to
    // catch, so exactly 1, not >= 1.
    expect(result.ownSessionsEnded).toBe(1);

    const deletedParent = await admin.parent.findUnique({ where: { id: coParent.id } });
    expect(deletedParent?.status).toBe('deleted');
    expect(deletedParent?.deletedAt).not.toBeNull();

    // §7.3's "every Family this Parent solely owns" branch — coParent
    // owns coParentOwnFamily outright, so it is cascaded exactly like
    // softDeleteFamily, not merely assignment-revoked.
    const ownFamilyAfter = await admin.family.findUnique({ where: { id: coParentOwnFamily.id } });
    expect(ownFamilyAfter?.status).toBe('deleted');

    const coParentDeviceAfter = await admin.device.findUnique({ where: { id: coParentDevice.id } });
    expect(coParentDeviceAfter?.status).toBe('deleted');

    const endedOwnFamilySession = await admin.session.findUnique({
      where: { id: coParentOwnSession.id },
    });
    expect(endedOwnFamilySession?.endedAt).not.toBeNull();
    expect(endedOwnFamilySession?.endReason).toBe('family_deleted');

    const endedStaleSession = await admin.session.findUnique({ where: { id: staleSession.id } });
    expect(endedStaleSession?.endedAt).not.toBeNull();
    expect(endedStaleSession?.endReason).toBe('account_deleted');

    const events = await admin.auditEvent.findMany({
      where: { eventType: 'account_deleted', targetId: coParent.id },
    });
    expect(events).toHaveLength(1);
    expect(events[0]?.actorRoleAtTime).toBeNull();
  });

  it('runHardDeleteSweep (§6, §12, §13.1; M18 §5.3/§5.4/§7.5) tombstones only rows whose window has elapsed, destroys the Family DEK, expires aged-out version_history, and records deletion_completed', async () => {
    // childOne and `family` were both soft-deleted by the family-
    // delete cascade above — backdate both past the 90-day window to
    // make them eligible, without changing the service's own config.
    // childOne's own Leo rows (soft-deleted in the same cascade) are
    // backdated too, so the generic Leo hard-delete sweep below has
    // something eligible to find.
    const ninetyOneDaysAgo = new Date(Date.now() - 91 * 24 * 60 * 60 * 1000);
    await admin.child.update({ where: { id: childOne.id }, data: { deletedAt: ninetyOneDaysAgo } });
    await admin.family.update({ where: { id: family.id }, data: { deletedAt: ninetyOneDaysAgo } });
    await admin.conversation.update({
      where: { id: childOneConversationId },
      data: { deletedAt: ninetyOneDaysAgo },
    });
    await admin.message.update({
      where: { id: childOneMessageId },
      data: { deletedAt: ninetyOneDaysAgo },
    });
    await admin.leoMemory.update({
      where: { id: childOneMemoryId },
      data: { deletedAt: ninetyOneDaysAgo },
    });
    // childTwo was soft-deleted directly in the first test — leave its
    // deletedAt at "now" so it is provably NOT swept yet.

    const result = await lifecycleService.runHardDeleteSweep();
    expect(result.tombstonedChildren).toBeGreaterThanOrEqual(1);
    expect(result.tombstonedFamilies).toBeGreaterThanOrEqual(1);
    expect(result.leoTombstonedConversations).toBeGreaterThanOrEqual(1);
    expect(result.leoTombstonedMessages).toBeGreaterThanOrEqual(1);
    expect(result.leoTombstonedMemories).toBeGreaterThanOrEqual(1);
    expect(result.leoVersionHistoryExpired).toBeGreaterThanOrEqual(1);
    expect(result.familyDeksDestroyed).toBeGreaterThanOrEqual(1);

    const tombstonedChild = await admin.child.findUnique({ where: { id: childOne.id } });
    expect(tombstonedChild?.hardDeletedAt).not.toBeNull();
    expect(tombstonedChild?.firstName).toBe('[deleted]');
    expect(tombstonedChild?.dateOfBirth.getUTCFullYear()).toBe(1970);

    const notYetEligibleChild = await admin.child.findUnique({ where: { id: childTwo.id } });
    expect(notYetEligibleChild?.hardDeletedAt).toBeNull();
    expect(notYetEligibleChild?.firstName).toBe('Fictional Child Two');

    // M18 §7.5 — the Family completing hard-delete destroys its
    // FamilyEncryptionKey row, the real crypto-shred.
    const familyKeyAfter = await admin.familyEncryptionKey.findUnique({
      where: { familyId: family.id },
    });
    expect(familyKeyAfter).toBeNull();

    // The generic 90-day sweep tombstoned childOne's Conversation/
    // Message/LeoMemory — content scrubbed, same fixed-erasure-marker
    // pattern as Child.
    const tombstonedMessage = await admin.message.findUnique({ where: { id: childOneMessageId } });
    expect(tombstonedMessage?.hardDeletedAt).not.toBeNull();
    expect(tombstonedMessage?.content.length).toBe(0);
    const tombstonedMemory = await admin.leoMemory.findUnique({ where: { id: childOneMemoryId } });
    expect(tombstonedMemory?.hardDeletedAt).not.toBeNull();
    expect(tombstonedMemory?.content.length).toBe(0);

    // §5.4 — the version_history row ages out independently, on its
    // own 90-day-from-createdAt window, regardless of soft-delete
    // status (this row was never soft-deleted by any cascade).
    const expiredVersionHistory = await admin.leoMemory.findUnique({
      where: { id: versionHistoryMemoryId },
    });
    expect(expiredVersionHistory?.hardDeletedAt).not.toBeNull();
    expect(expiredVersionHistory?.content.length).toBe(0);

    const childEvents = await admin.auditEvent.findMany({
      where: { eventType: 'deletion_completed', targetId: childOne.id },
    });
    expect(childEvents).toHaveLength(1);
    const childMetadata = childEvents[0]?.metadata as {
      cascadeTargets?: { tier3CryptoShredding?: string };
    };
    expect(childMetadata.cascadeTargets?.tier3CryptoShredding).toContain('not_applicable');

    const familyEvents = await admin.auditEvent.findMany({
      where: { eventType: 'deletion_completed', targetId: family.id },
    });
    expect(familyEvents).toHaveLength(1);
    const familyMetadata = familyEvents[0]?.metadata as {
      cascadeTargets?: { tier3CryptoShredding?: string };
    };
    expect(familyMetadata.cascadeTargets?.tier3CryptoShredding).toContain('destroyed');
  });
});
