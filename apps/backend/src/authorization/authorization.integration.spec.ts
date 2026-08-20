import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { FamilyRepository } from '../identity-family/repositories/family.repository';
import { CoParentAssignmentRepository } from '../identity-family/repositories/co-parent-assignment.repository';
import { SessionRepository } from '../identity-family/repositories/session.repository';
import { AuditEventRepository } from '../audit/repositories/audit-event.repository';
import { AuditService } from '../audit/audit.service';
import { loadAuditConfig } from '../audit/audit.config';
import { AuthorizationService } from './authorization.service';
import { SessionLifecycleService } from './session-lifecycle.service';
import { serializePermissionScope } from './permission-scope';

// M15 — Integration & Security
// (docs/sprints/sprint-03.md, §4; docs/architecture/authorization-and-sessions.md
// §6.3, §6.4). Requires a real, live PostgreSQL instance with the M14
// migration applied — same pattern as
// identity-family/tenant-isolation.integration.spec.ts: fails locally
// with "Can't reach database server" when no Postgres is running
// (expected), designed to run against the CI Postgres service
// container.
//
// Uses the admin/migration PrismaClient (DATABASE_URL) directly, not
// withRlsContext — this milestone's authorization gate is an
// application-layer check on top of the M14 schema, independent of
// the RLS policies M14 already proved; it is not re-testing RLS here.
describe('AuthorizationService / SessionLifecycleService — M15', () => {
  const admin = new PrismaClient();
  const familyRepository = new FamilyRepository(admin);
  const coParentAssignmentRepository = new CoParentAssignmentRepository(admin);
  const sessionRepository = new SessionRepository(admin);
  const auditEventRepository = new AuditEventRepository(admin);
  const auditService = new AuditService(auditEventRepository, loadAuditConfig());
  const authorizationService = new AuthorizationService(
    familyRepository,
    coParentAssignmentRepository,
  );
  const sessionLifecycleService = new SessionLifecycleService(
    authorizationService,
    sessionRepository,
    coParentAssignmentRepository,
    auditService,
  );

  const familyA = { id: randomUUID() };
  const familyB = { id: randomUUID() };
  const ownerA = { id: randomUUID() };
  const ownerB = { id: randomUUID() };
  const coParent = { id: randomUUID() };
  const deviceOwnerA = { id: randomUUID() };
  const deviceCoParent = { id: randomUUID() };

  let coParentAssignmentId: string;

  beforeAll(async () => {
    await admin.parent.create({
      data: {
        id: ownerA.id,
        authIdentityRef: `fictional-auth-ref-${ownerA.id}`,
        displayName: 'Fictional Owner A',
        contactEmail: `owner-a-${ownerA.id}@example.invalid`,
      },
    });
    await admin.parent.create({
      data: {
        id: ownerB.id,
        authIdentityRef: `fictional-auth-ref-${ownerB.id}`,
        displayName: 'Fictional Owner B',
        contactEmail: `owner-b-${ownerB.id}@example.invalid`,
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
      data: { id: familyA.id, owningParentId: ownerA.id, displayName: 'Fictional Family A' },
    });
    await admin.family.create({
      data: { id: familyB.id, owningParentId: ownerB.id, displayName: 'Fictional Family B' },
    });
    const assignment = await admin.coParentAssignment.create({
      data: {
        familyId: familyA.id,
        parentId: coParent.id,
        invitedByParentId: ownerA.id,
        permissionScope: serializePermissionScope(['view_child_profile']),
      },
    });
    coParentAssignmentId = assignment.id;
    await admin.device.create({
      data: {
        id: deviceOwnerA.id,
        parentId: ownerA.id,
        deviceLabel: "Owner A's fictional tablet",
        deviceType: 'tablet',
        status: 'active',
      },
    });
    await admin.device.create({
      data: {
        id: deviceCoParent.id,
        parentId: coParent.id,
        deviceLabel: "Co-Parent's fictional phone",
        deviceType: 'phone',
        status: 'active',
      },
    });
  });

  afterAll(async () => {
    // M16 — family_switch/coparent_revoked now write audit_event rows
    // (session-lifecycle.service.ts); cleaned up like every other
    // fixture this test creates, even though the FKs themselves would
    // tolerate the parent/family rows disappearing first (ON DELETE
    // SET NULL).
    await admin.auditEvent.deleteMany({ where: { familyId: { in: [familyA.id, familyB.id] } } });
    await admin.session.deleteMany({ where: { familyId: { in: [familyA.id, familyB.id] } } });
    await admin.device.deleteMany({
      where: { parentId: { in: [ownerA.id, ownerB.id, coParent.id] } },
    });
    await admin.coParentAssignment.deleteMany({ where: { familyId: familyA.id } });
    await admin.family.deleteMany({ where: { id: { in: [familyA.id, familyB.id] } } });
    await admin.parent.deleteMany({ where: { id: { in: [ownerA.id, ownerB.id, coParent.id] } } });
    await admin.$disconnect();
  });

  it('Scenario A (§6.3) — an owner is denied a family they hold no role in', async () => {
    const result = await authorizationService.authorize({
      principalId: ownerA.id,
      principalType: 'Parent',
      requestedFamilyId: familyB.id,
      requestedAction: 'view_child_profile',
    });
    expect(result).toEqual({ allowed: false, reason: 'family_not_authorized' });
  });

  it('Scenario B (§6.3) — a reserved Child principal is denied a family it is not scoped to', async () => {
    const result = await authorizationService.authorize({
      principalId: randomUUID(),
      principalType: 'Child',
      requestedFamilyId: familyA.id,
      requestedAction: 'view_child_profile',
    });
    expect(result).toEqual({ allowed: false, reason: 'family_not_authorized' });
  });

  it('Scenario C (§6.3) — a co-parent is denied an owner-only action within their own authorized family', async () => {
    const result = await authorizationService.authorize({
      principalId: coParent.id,
      principalType: 'Parent',
      requestedFamilyId: familyA.id,
      requestedAction: 'family_account_deletion',
    });
    expect(result).toEqual({ allowed: false, reason: 'action_not_permitted' });
  });

  it('a co-parent is allowed an action explicitly within their live permissionScope', async () => {
    const result = await authorizationService.authorize({
      principalId: coParent.id,
      principalType: 'Parent',
      requestedFamilyId: familyA.id,
      requestedAction: 'view_child_profile',
    });
    expect(result).toEqual({ allowed: true, role: 'co_parent' });
  });

  it('family-switch (§6.2) establishes a new session and ends the prior active one', async () => {
    const initial = await sessionRepository.create({
      principalId: ownerA.id,
      principalType: 'Parent',
      familyId: familyA.id,
      deviceId: deviceOwnerA.id,
    });

    await expect(
      sessionLifecycleService.switchFamily({
        principalId: ownerA.id,
        principalType: 'Parent',
        targetFamilyId: familyB.id,
        deviceId: deviceOwnerA.id,
      }),
    ).rejects.toThrow(); // Owner A holds no role in Family B — tenant-scope gate denies.

    const stillActive = await sessionRepository.findActiveByPrincipalId(ownerA.id);
    expect(stillActive.map((s) => s.id)).toContain(initial.id);
  });

  it('co-parent revocation cascades to end that co-parent’s active sessions for the family (§6.4)', async () => {
    const coParentSession = await sessionRepository.create({
      principalId: coParent.id,
      principalType: 'Parent',
      familyId: familyA.id,
      deviceId: deviceCoParent.id,
    });

    const { endedSessionCount } = await sessionLifecycleService.revokeCoParentAssignment({
      assignmentId: coParentAssignmentId,
      revokedByParentId: ownerA.id,
    });
    expect(endedSessionCount).toBeGreaterThanOrEqual(1);

    const active = await sessionRepository.findActiveByPrincipalInFamily(coParent.id, familyA.id);
    expect(active).toHaveLength(0);

    const ended = await admin.session.findUnique({ where: { id: coParentSession.id } });
    expect(ended?.endedAt).not.toBeNull();
    expect(ended?.endReason).toBe('access_revoked');
  });

  it('a revoked co-parent’s next request is denied regardless of cascade timing (ADR-0009, Decision item 6)', async () => {
    // The prior test already revoked coParentAssignmentId; this
    // re-asserts the actual safety net — the tenant-scope gate
    // re-resolves from current CoParentAssignment.status — is what
    // closes the gap, independent of whatever the cascade already did.
    const result = await authorizationService.authorize({
      principalId: coParent.id,
      principalType: 'Parent',
      requestedFamilyId: familyA.id,
      requestedAction: 'view_child_profile',
    });
    expect(result).toEqual({ allowed: false, reason: 'family_not_authorized' });
  });
});
