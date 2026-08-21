import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { disconnectAppPrismaClient, withRlsContext } from '../identity-family/rls-context';

// M17 — Row-Level Security for consent_event
// (docs/sprints/sprint-03.md, §4; docs/architecture/consent-architecture.md
// §6.2; this migration's own Part 3 comment). Same live-Postgres
// pattern as identity-family/tenant-isolation.integration.spec.ts and
// audit/audit-tenant-isolation.integration.spec.ts: fixtures via the
// admin/superuser client, assertions via withRlsContext against the
// non-superuser, non-BYPASSRLS natkhat_app_role.
describe('Consent-event tenant isolation — Row-Level Security (M17)', () => {
  const admin = new PrismaClient();

  const familyA = { id: randomUUID() };
  const familyB = { id: randomUUID() };
  const parentA = { id: randomUUID() };
  const parentB = { id: randomUUID() };

  let consentEventAId: string;
  let consentEventBId: string;

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

    const eventA = await admin.consentEvent.create({
      data: {
        familyId: familyA.id,
        consentingParentId: parentA.id,
        consentType: 'child_account_creation',
        action: 'granted',
        privacyTermsVersion: 'fictional-terms-v1',
      },
    });
    consentEventAId = eventA.id;

    const eventB = await admin.consentEvent.create({
      data: {
        familyId: familyB.id,
        consentingParentId: parentB.id,
        consentType: 'child_account_creation',
        action: 'granted',
        privacyTermsVersion: 'fictional-terms-v1',
      },
    });
    consentEventBId = eventB.id;
  });

  afterAll(async () => {
    await admin.consentEvent.deleteMany({
      where: { id: { in: [consentEventAId, consentEventBId] } },
    });
    await admin.family.deleteMany({ where: { id: { in: [familyA.id, familyB.id] } } });
    await admin.parent.deleteMany({ where: { id: { in: [parentA.id, parentB.id] } } });
    await admin.$disconnect();
    await disconnectAppPrismaClient();
  });

  it('FORCE ROW LEVEL SECURITY is applied to consent_event', async () => {
    const rows = await admin.$queryRaw<Array<{ relforcerowsecurity: boolean }>>`
      SELECT relforcerowsecurity FROM pg_class WHERE relname = 'consent_event'
    `;
    expect(rows).toHaveLength(1);
    expect(rows[0]?.relforcerowsecurity).toBe(true);
  });

  it('the request-serving role can SELECT/INSERT but not UPDATE/DELETE consent_event', async () => {
    const rows = await admin.$queryRaw<Array<{ privilege_type: string }>>`
      SELECT privilege_type FROM information_schema.role_table_grants
      WHERE table_name = 'consent_event' AND grantee = 'natkhat_app_role'
    `;
    const privileges = rows.map((row) => row.privilege_type).sort();
    expect(privileges).toEqual(['INSERT', 'SELECT']);
  });

  it('a principal scoped to Family A cannot see Family B’s consent event', async () => {
    const visible = await withRlsContext({ principalId: parentA.id, familyId: familyA.id }, (tx) =>
      tx.consentEvent.findMany(),
    );
    expect(visible.map((event) => event.id)).toEqual([consentEventAId]);
    expect(visible.map((event) => event.id)).not.toContain(consentEventBId);

    const directLookup = await withRlsContext(
      { principalId: parentA.id, familyId: familyA.id },
      (tx) => tx.consentEvent.findUnique({ where: { id: consentEventBId } }),
    );
    expect(directLookup).toBeNull();
  });

  it('RLS rejects inserting a consent_event into a different family (WITH CHECK)', async () => {
    await expect(
      withRlsContext({ principalId: parentA.id, familyId: familyA.id }, (tx) =>
        tx.consentEvent.create({
          data: {
            familyId: familyB.id,
            consentingParentId: parentA.id,
            consentType: 'child_account_creation',
            action: 'granted',
            privacyTermsVersion: 'fictional-terms-v1',
          },
        }),
      ),
    ).rejects.toThrow();
  });

  it('absent session claims fail closed (zero rows, not an error)', async () => {
    const visible = await withRlsContext({}, (tx) => tx.consentEvent.findMany());
    expect(visible).toHaveLength(0);
  });
});
