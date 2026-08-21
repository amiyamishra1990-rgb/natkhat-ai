import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { disconnectAppPrismaClient, withRlsContext } from '../identity-family/rls-context';

// M18 — Row-Level Security for conversation/message/leo_memory
// (docs/sprints/sprint-03.md, §4; ai-memory-isolation.md §7.2-§7.3;
// this migration's own Part 2/3 comments). Same live-Postgres pattern
// as identity-family/tenant-isolation.integration.spec.ts,
// audit/audit-tenant-isolation.integration.spec.ts, and
// consent/consent-tenant-isolation.integration.spec.ts: fixtures via
// the admin/superuser client, assertions via withRlsContext against
// the non-superuser, non-BYPASSRLS natkhat_app_role. Cross-CHILD
// isolation (§7.4) is deliberately NOT tested here — no RLS policy
// expresses it (§7.6's recorded residual risk) — see
// leo-cross-child-isolation.integration.spec.ts for that boundary,
// which is application-layer and therefore exercised through
// LeoService, not withRlsContext.
describe('Leo (conversation/message/leo_memory/family_encryption_key) tenant isolation — Row-Level Security (M18)', () => {
  const admin = new PrismaClient();

  const familyA = { id: randomUUID() };
  const familyB = { id: randomUUID() };
  const parentA = { id: randomUUID() };
  const parentB = { id: randomUUID() };
  const childA = { id: randomUUID() };
  const childB = { id: randomUUID() };

  let conversationAId: string;
  let conversationBId: string;
  let messageAId: string;
  let messageBId: string;
  let memoryAId: string;
  let memoryBId: string;

  beforeAll(async () => {
    await admin.parent.create({
      data: {
        id: parentA.id,
        authIdentityRef: `fictional-auth-ref-${parentA.id}`,
        displayName: 'Fictional Parent A',
        contactEmail: `parent-a-${parentA.id}@example.invalid`,
      },
    });
    await admin.parent.create({
      data: {
        id: parentB.id,
        authIdentityRef: `fictional-auth-ref-${parentB.id}`,
        displayName: 'Fictional Parent B',
        contactEmail: `parent-b-${parentB.id}@example.invalid`,
      },
    });
    await admin.family.create({
      data: { id: familyA.id, owningParentId: parentA.id, displayName: 'Fictional Family A' },
    });
    await admin.family.create({
      data: { id: familyB.id, owningParentId: parentB.id, displayName: 'Fictional Family B' },
    });
    await admin.child.create({
      data: {
        id: childA.id,
        familyId: familyA.id,
        firstName: 'Fictional Child A',
        dateOfBirth: new Date('2019-01-01'),
        createdByParentId: parentA.id,
      },
    });
    await admin.child.create({
      data: {
        id: childB.id,
        familyId: familyB.id,
        firstName: 'Fictional Child B',
        dateOfBirth: new Date('2019-01-01'),
        createdByParentId: parentB.id,
      },
    });

    const conversationA = await admin.conversation.create({
      data: { familyId: familyA.id, childId: childA.id },
    });
    conversationAId = conversationA.id;
    const conversationB = await admin.conversation.create({
      data: { familyId: familyB.id, childId: childB.id },
    });
    conversationBId = conversationB.id;

    const messageA = await admin.message.create({
      data: {
        conversationId: conversationAId,
        familyId: familyA.id,
        childId: childA.id,
        sender: 'child',
        content: Buffer.from('fictional-ciphertext-a'),
      },
    });
    messageAId = messageA.id;
    const messageB = await admin.message.create({
      data: {
        conversationId: conversationBId,
        familyId: familyB.id,
        childId: childB.id,
        sender: 'child',
        content: Buffer.from('fictional-ciphertext-b'),
      },
    });
    messageBId = messageB.id;

    const memoryA = await admin.leoMemory.create({
      data: {
        familyId: familyA.id,
        childId: childA.id,
        memoryClass: 'active_relationship',
        content: Buffer.from('fictional-memory-ciphertext-a'),
      },
    });
    memoryAId = memoryA.id;
    const memoryB = await admin.leoMemory.create({
      data: {
        familyId: familyB.id,
        childId: childB.id,
        memoryClass: 'active_relationship',
        content: Buffer.from('fictional-memory-ciphertext-b'),
      },
    });
    memoryBId = memoryB.id;
  });

  afterAll(async () => {
    await admin.leoMemory.deleteMany({ where: { familyId: { in: [familyA.id, familyB.id] } } });
    await admin.message.deleteMany({ where: { familyId: { in: [familyA.id, familyB.id] } } });
    await admin.conversation.deleteMany({ where: { familyId: { in: [familyA.id, familyB.id] } } });
    await admin.child.deleteMany({ where: { familyId: { in: [familyA.id, familyB.id] } } });
    await admin.family.deleteMany({ where: { id: { in: [familyA.id, familyB.id] } } });
    await admin.parent.deleteMany({ where: { id: { in: [parentA.id, parentB.id] } } });
    await admin.$disconnect();
    await disconnectAppPrismaClient();
  });

  it('FORCE ROW LEVEL SECURITY is applied to conversation, message, leo_memory, and family_encryption_key', async () => {
    const rows = await admin.$queryRaw<Array<{ relname: string; relforcerowsecurity: boolean }>>`
      SELECT relname, relforcerowsecurity FROM pg_class
      WHERE relname IN ('conversation', 'message', 'leo_memory', 'family_encryption_key')
    `;
    expect(rows).toHaveLength(4);
    for (const row of rows) {
      expect(row.relforcerowsecurity).toBe(true);
    }
  });

  it("natkhat_app_role can SELECT/INSERT/UPDATE but not DELETE conversation/message/leo_memory — unlike M16/M17's append-only tables", async () => {
    const rows = await admin.$queryRaw<Array<{ table_name: string; privilege_type: string }>>`
      SELECT table_name, privilege_type FROM information_schema.role_table_grants
      WHERE table_name IN ('conversation', 'message', 'leo_memory') AND grantee = 'natkhat_app_role'
    `;
    for (const tableName of ['conversation', 'message', 'leo_memory']) {
      const privileges = rows
        .filter((row) => row.table_name === tableName)
        .map((row) => row.privilege_type)
        .sort();
      expect(privileges).toEqual(['INSERT', 'SELECT', 'UPDATE']);
    }
  });

  it('natkhat_app_role has NO grant at all on family_encryption_key', async () => {
    const rows = await admin.$queryRaw<Array<{ privilege_type: string }>>`
      SELECT privilege_type FROM information_schema.role_table_grants
      WHERE table_name = 'family_encryption_key' AND grantee = 'natkhat_app_role'
    `;
    expect(rows).toHaveLength(0);
  });

  it("a principal scoped to Family A cannot see Family B's conversation, message, or leo_memory rows", async () => {
    const visibleConversations = await withRlsContext(
      { principalId: parentA.id, familyId: familyA.id },
      (tx) => tx.conversation.findMany(),
    );
    expect(visibleConversations.map((c) => c.id)).toEqual([conversationAId]);

    const visibleMessages = await withRlsContext(
      { principalId: parentA.id, familyId: familyA.id },
      (tx) => tx.message.findMany(),
    );
    expect(visibleMessages.map((m) => m.id)).toEqual([messageAId]);

    const visibleMemories = await withRlsContext(
      { principalId: parentA.id, familyId: familyA.id },
      (tx) => tx.leoMemory.findMany(),
    );
    expect(visibleMemories.map((m) => m.id)).toEqual([memoryAId]);

    const directConversationLookup = await withRlsContext(
      { principalId: parentA.id, familyId: familyA.id },
      (tx) => tx.conversation.findUnique({ where: { id: conversationBId } }),
    );
    expect(directConversationLookup).toBeNull();

    const directMessageLookup = await withRlsContext(
      { principalId: parentA.id, familyId: familyA.id },
      (tx) => tx.message.findUnique({ where: { id: messageBId } }),
    );
    expect(directMessageLookup).toBeNull();

    const directMemoryLookup = await withRlsContext(
      { principalId: parentA.id, familyId: familyA.id },
      (tx) => tx.leoMemory.findUnique({ where: { id: memoryBId } }),
    );
    expect(directMemoryLookup).toBeNull();
  });

  it('RLS rejects inserting a conversation/message/leo_memory into a different family (WITH CHECK)', async () => {
    await expect(
      withRlsContext({ principalId: parentA.id, familyId: familyA.id }, (tx) =>
        tx.conversation.create({ data: { familyId: familyB.id, childId: childB.id } }),
      ),
    ).rejects.toThrow();

    await expect(
      withRlsContext({ principalId: parentA.id, familyId: familyA.id }, (tx) =>
        tx.message.create({
          data: {
            conversationId: conversationAId,
            familyId: familyB.id,
            childId: childB.id,
            sender: 'child',
            content: Buffer.from('fictional'),
          },
        }),
      ),
    ).rejects.toThrow();

    await expect(
      withRlsContext({ principalId: parentA.id, familyId: familyA.id }, (tx) =>
        tx.leoMemory.create({
          data: {
            familyId: familyB.id,
            childId: childB.id,
            memoryClass: 'active_relationship',
            content: Buffer.from('fictional'),
          },
        }),
      ),
    ).rejects.toThrow();
  });

  it('any natkhat_app_role query against family_encryption_key is rejected outright (no grant, not merely zero rows)', async () => {
    await expect(
      withRlsContext({ principalId: parentA.id, familyId: familyA.id }, (tx) =>
        tx.familyEncryptionKey.findMany(),
      ),
    ).rejects.toThrow();
  });

  it('absent session claims fail closed (zero rows, not an error) for conversation/message/leo_memory', async () => {
    const visibleConversations = await withRlsContext({}, (tx) => tx.conversation.findMany());
    const visibleMessages = await withRlsContext({}, (tx) => tx.message.findMany());
    const visibleMemories = await withRlsContext({}, (tx) => tx.leoMemory.findMany());
    expect(visibleConversations).toHaveLength(0);
    expect(visibleMessages).toHaveLength(0);
    expect(visibleMemories).toHaveLength(0);
  });
});
