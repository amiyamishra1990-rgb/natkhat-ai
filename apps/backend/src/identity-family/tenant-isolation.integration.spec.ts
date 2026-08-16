import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { disconnectAppPrismaClient, withRlsContext } from './rls-context';

// M14 — Integration & Security (docs/sprints/sprint-03.md, §4;
// data-classification-and-isolation.md, §8, §12). Requires a real,
// live PostgreSQL instance with the M14 migration applied — matching
// the exact pattern established by
// apps/backend/src/db-connectivity.spec.ts (M13): this fails locally
// with "Can't reach database server" when no Docker/Postgres is
// running (expected, undisclosed nowhere), and is designed to run
// against the CI Postgres service container once the M14 migration is
// deployed to it.
//
// Fixtures are created via the admin/migration client (DATABASE_URL,
// `postgres` superuser — always bypasses RLS, which is exactly why it
// is safe and correct to use for fixture setup). The isolation
// assertions themselves run via withRlsContext, i.e. as the
// non-superuser, non-BYPASSRLS `natkhat_app_role` (APP_DATABASE_URL) —
// the only connection RLS enforcement can actually be proven against
// (ADR-0010 §7.4).
describe('Identity/Family tenant isolation — Row-Level Security (M14)', () => {
  const admin = new PrismaClient();

  const familyA = { id: randomUUID() };
  const familyB = { id: randomUUID() };
  const parentA = { id: randomUUID() };
  const parentB = { id: randomUUID() };
  const childA = { id: randomUUID() };
  const childB = { id: randomUUID() };
  const deviceA = { id: randomUUID() };
  const deviceB = { id: randomUUID() };

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
        dateOfBirth: new Date('2019-06-01'),
        createdByParentId: parentA.id,
      },
    });
    await admin.child.create({
      data: {
        id: childB.id,
        familyId: familyB.id,
        firstName: 'Fictional Child B',
        dateOfBirth: new Date('2020-09-01'),
        createdByParentId: parentB.id,
      },
    });
    await admin.device.create({
      data: {
        id: deviceA.id,
        parentId: parentA.id,
        deviceLabel: "Parent A's fictional tablet",
        deviceType: 'tablet',
        status: 'active',
      },
    });
    await admin.device.create({
      data: {
        id: deviceB.id,
        parentId: parentB.id,
        deviceLabel: "Parent B's fictional phone",
        deviceType: 'phone',
        status: 'active',
      },
    });
    await admin.session.create({
      data: {
        principalId: parentA.id,
        principalType: 'Parent',
        familyId: familyA.id,
        deviceId: deviceA.id,
      },
    });
    await admin.session.create({
      data: {
        principalId: parentB.id,
        principalType: 'Parent',
        familyId: familyB.id,
        deviceId: deviceB.id,
      },
    });
  });

  afterAll(async () => {
    // FK-safe deletion order (children of the FK graph first).
    await admin.session.deleteMany({ where: { familyId: { in: [familyA.id, familyB.id] } } });
    await admin.device.deleteMany({ where: { parentId: { in: [parentA.id, parentB.id] } } });
    await admin.child.deleteMany({ where: { familyId: { in: [familyA.id, familyB.id] } } });
    await admin.family.deleteMany({ where: { id: { in: [familyA.id, familyB.id] } } });
    await admin.parent.deleteMany({ where: { id: { in: [parentA.id, parentB.id] } } });
    await admin.$disconnect();
    await disconnectAppPrismaClient();
  });

  it('FORCE ROW LEVEL SECURITY is applied to every M14 table', async () => {
    const rows = await admin.$queryRaw<Array<{ relname: string; relforcerowsecurity: boolean }>>`
      SELECT relname, relforcerowsecurity
      FROM pg_class
      WHERE relname IN ('parent', 'family', 'child', 'co_parent_assignment', 'device', 'session')
    `;
    expect(rows).toHaveLength(6);
    for (const row of rows) {
      expect(row.relforcerowsecurity).toBe(true);
    }
  });

  it('the request-serving role holds neither BYPASSRLS nor superuser', async () => {
    const rows = await admin.$queryRaw<Array<{ rolbypassrls: boolean; rolsuper: boolean }>>`
      SELECT rolbypassrls, rolsuper FROM pg_roles WHERE rolname = 'natkhat_app_role'
    `;
    expect(rows).toHaveLength(1);
    const [role] = rows;
    expect(role?.rolbypassrls).toBe(false);
    expect(role?.rolsuper).toBe(false);
  });

  it('Family tenant isolation: a cross-family Child query is rejected by RLS', async () => {
    const visibleChildren = await withRlsContext(
      { principalId: parentA.id, familyId: familyA.id },
      (tx) => tx.child.findMany(),
    );
    expect(visibleChildren.map((c) => c.id)).toEqual([childA.id]);
    expect(visibleChildren.map((c) => c.id)).not.toContain(childB.id);

    const directLookup = await withRlsContext(
      { principalId: parentA.id, familyId: familyA.id },
      (tx) => tx.child.findUnique({ where: { id: childB.id } }),
    );
    expect(directLookup).toBeNull();
  });

  it('Family tenant isolation: RLS rejects inserting a Child into a different family (WITH CHECK)', async () => {
    await expect(
      withRlsContext({ principalId: parentA.id, familyId: familyA.id }, (tx) =>
        tx.child.create({
          data: {
            familyId: familyB.id,
            firstName: 'Fictional Cross-Family Attempt',
            dateOfBirth: new Date('2021-01-01'),
            createdByParentId: parentA.id,
          },
        }),
      ),
    ).rejects.toThrow();
  });

  it('Device isolation: Parent-scoped, not Family-scoped', async () => {
    const visibleDevices = await withRlsContext({ principalId: parentA.id }, (tx) =>
      tx.device.findMany(),
    );
    expect(visibleDevices.map((d) => d.id)).toEqual([deviceA.id]);
    expect(visibleDevices.map((d) => d.id)).not.toContain(deviceB.id);
  });

  it('Session visibility: Parent-scoped via principal_id, not Family-scoped', async () => {
    const visibleSessions = await withRlsContext({ principalId: parentA.id }, (tx) =>
      tx.session.findMany(),
    );
    expect(visibleSessions.every((s) => s.principalId === parentA.id)).toBe(true);
    expect(visibleSessions.some((s) => s.principalId === parentB.id)).toBe(false);
  });

  it('absent session claims fail closed (zero rows, not an error)', async () => {
    const visibleChildren = await withRlsContext({}, (tx) => tx.child.findMany());
    expect(visibleChildren).toHaveLength(0);
  });
});
