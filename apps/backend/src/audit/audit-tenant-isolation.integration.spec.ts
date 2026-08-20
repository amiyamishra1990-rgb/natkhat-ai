import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { disconnectAppPrismaClient, withRlsContext } from '../identity-family/rls-context';

// M16 — Row-Level Security for audit_event
// (docs/sprints/sprint-03.md, §4; docs/architecture/audit-logging.md
// §8.2; this migration's own Part 3 comment). Same live-Postgres
// pattern as identity-family/tenant-isolation.integration.spec.ts:
// fixtures via the admin/superuser client (always bypasses RLS),
// assertions via withRlsContext against the non-superuser,
// non-BYPASSRLS natkhat_app_role — the only connection RLS can
// actually be proven against.
//
// Proves the hybrid family_id-OR-actor_principal_id policy this
// migration resolved audit-logging.md §8.2's open engineering
// question with: a principal scoped to a family sees every
// family-scoped event for it (including another principal's event
// against that family, per §7's share_link_accessed requirement);
// a principal always sees their own family-less events (account_deleted);
// a third party with neither claim sees nothing.
describe('Audit-event tenant isolation — Row-Level Security (M16)', () => {
  const admin = new PrismaClient();

  const familyA = { id: randomUUID() };
  const parentA = { id: randomUUID() };
  const parentB = { id: randomUUID() };

  let familyScopedEventId: string;
  let accountDeletedEventForParentB: string;

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

    // A family-scoped event whose actor is a *different* principal
    // than the family's owner — the specific shape §7's
    // share_link_accessed requirement needs to work (a family-scoped
    // viewer other than the actor themselves).
    const familyScopedEvent = await admin.auditEvent.create({
      data: {
        eventType: 'family_switch',
        actorPrincipalId: parentB.id,
        actorPrincipalType: 'Parent',
        familyId: familyA.id,
        targetType: 'Family',
        targetId: familyA.id,
      },
    });
    familyScopedEventId = familyScopedEvent.id;

    // A family-less event (account_deleted has no single family_id),
    // visible only via the actor_principal_id branch of the policy.
    const accountDeletedEvent = await admin.auditEvent.create({
      data: {
        eventType: 'account_deleted',
        actorPrincipalId: parentB.id,
        actorPrincipalType: 'Parent',
        familyId: null,
        targetType: 'Parent',
        targetId: parentB.id,
      },
    });
    accountDeletedEventForParentB = accountDeletedEvent.id;
  });

  afterAll(async () => {
    await admin.auditEvent.deleteMany({
      where: { id: { in: [familyScopedEventId, accountDeletedEventForParentB] } },
    });
    await admin.family.deleteMany({ where: { id: familyA.id } });
    await admin.parent.deleteMany({ where: { id: { in: [parentA.id, parentB.id] } } });
    await admin.$disconnect();
    await disconnectAppPrismaClient();
  });

  it('FORCE ROW LEVEL SECURITY is applied to audit_event', async () => {
    const rows = await admin.$queryRaw<Array<{ relforcerowsecurity: boolean }>>`
      SELECT relforcerowsecurity FROM pg_class WHERE relname = 'audit_event'
    `;
    expect(rows).toHaveLength(1);
    expect(rows[0]?.relforcerowsecurity).toBe(true);
  });

  it('the request-serving role can SELECT/INSERT but not UPDATE/DELETE audit_event', async () => {
    const rows = await admin.$queryRaw<Array<{ privilege_type: string }>>`
      SELECT privilege_type FROM information_schema.role_table_grants
      WHERE table_name = 'audit_event' AND grantee = 'natkhat_app_role'
    `;
    const privileges = rows.map((row) => row.privilege_type).sort();
    expect(privileges).toEqual(['INSERT', 'SELECT']);
  });

  it('a principal scoped to the family sees a family-scoped event another principal performed', async () => {
    const visible = await withRlsContext({ principalId: parentA.id, familyId: familyA.id }, (tx) =>
      tx.auditEvent.findMany({ where: { id: familyScopedEventId } }),
    );
    expect(visible).toHaveLength(1);
  });

  it('a principal sees their own family-less event via the actor_principal_id branch', async () => {
    const visible = await withRlsContext({ principalId: parentB.id }, (tx) =>
      tx.auditEvent.findMany({ where: { id: accountDeletedEventForParentB } }),
    );
    expect(visible).toHaveLength(1);
  });

  it('a third party with neither a matching family claim nor a matching actor claim sees nothing', async () => {
    const outsider = randomUUID();
    const visibleFamilyScoped = await withRlsContext({ principalId: outsider }, (tx) =>
      tx.auditEvent.findMany({ where: { id: familyScopedEventId } }),
    );
    expect(visibleFamilyScoped).toHaveLength(0);

    const visibleAccountDeleted = await withRlsContext({ principalId: outsider }, (tx) =>
      tx.auditEvent.findMany({ where: { id: accountDeletedEventForParentB } }),
    );
    expect(visibleAccountDeleted).toHaveLength(0);
  });

  it('absent session claims fail closed (zero rows, not an error)', async () => {
    const visible = await withRlsContext({}, (tx) => tx.auditEvent.findMany());
    expect(visible).toHaveLength(0);
  });
});
