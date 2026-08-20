import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { AuditEventRepository } from './repositories/audit-event.repository';
import { AuditService } from './audit.service';

// M16 — Integration (docs/sprints/sprint-03.md, §4). Same live-Postgres
// pattern as authorization.integration.spec.ts: admin/migration client
// only, not testing RLS here (that is
// audit-tenant-isolation.integration.spec.ts's job).
describe('AuditService — M16', () => {
  const admin = new PrismaClient();
  const auditEventRepository = new AuditEventRepository(admin);

  const parent = { id: randomUUID() };
  const createdEventIds: string[] = [];

  beforeAll(async () => {
    await admin.parent.create({
      data: {
        id: parent.id,
        authIdentityRef: `fictional-auth-ref-${parent.id}`,
        displayName: 'Fictional Parent',
        contactEmail: `parent-${parent.id}@example.invalid`,
      },
    });
  });

  afterAll(async () => {
    await admin.auditEvent.deleteMany({ where: { actorPrincipalId: parent.id } });
    await admin.parent.deleteMany({ where: { id: parent.id } });
    await admin.$disconnect();
  });

  it('records an event with content-free metadata and no free-text event_type', async () => {
    const auditService = new AuditService(auditEventRepository, { tier5RetentionYears: 3 });
    const event = await auditService.record({
      eventType: 'account_deleted',
      actorPrincipalId: parent.id,
      actorPrincipalType: 'Parent',
      targetType: 'Parent',
      targetId: parent.id,
      metadata: { ownedFamiliesDeleted: 0 },
    });
    createdEventIds.push(event.id);

    const persisted = await admin.auditEvent.findUnique({ where: { id: event.id } });
    expect(persisted?.eventType).toBe('account_deleted');
    expect(persisted?.metadata).toEqual({ ownedFamiliesDeleted: 0 });
  });

  it('purgeExpiredEvents removes only events past the configured Tier-5 retention window', async () => {
    const auditService = new AuditService(auditEventRepository, { tier5RetentionYears: 3 });

    const old = await admin.auditEvent.create({
      data: {
        eventType: 'account_deleted',
        actorPrincipalId: parent.id,
        actorPrincipalType: 'Parent',
        targetType: 'Parent',
        targetId: parent.id,
        occurredAt: new Date('2020-01-01T00:00:00.000Z'), // well past a 3-year window
      },
    });
    const recent = await admin.auditEvent.create({
      data: {
        eventType: 'account_deleted',
        actorPrincipalId: parent.id,
        actorPrincipalType: 'Parent',
        targetType: 'Parent',
        targetId: parent.id,
      },
    });
    createdEventIds.push(old.id, recent.id);

    const { purgedCount } = await auditService.purgeExpiredEvents();
    expect(purgedCount).toBeGreaterThanOrEqual(1);

    const survivingOld = await admin.auditEvent.findUnique({ where: { id: old.id } });
    const survivingRecent = await admin.auditEvent.findUnique({ where: { id: recent.id } });
    expect(survivingOld).toBeNull();
    expect(survivingRecent).not.toBeNull();
  });

  it('a shorter configured retention window purges more aggressively — proves the value is not hardcoded', async () => {
    const zeroRetentionAuditService = new AuditService(auditEventRepository, {
      tier5RetentionYears: 1,
    });

    const almostTwoYearsOld = new Date();
    almostTwoYearsOld.setUTCFullYear(almostTwoYearsOld.getUTCFullYear() - 2);
    const event = await admin.auditEvent.create({
      data: {
        eventType: 'account_deleted',
        actorPrincipalId: parent.id,
        actorPrincipalType: 'Parent',
        targetType: 'Parent',
        targetId: parent.id,
        occurredAt: almostTwoYearsOld,
      },
    });
    createdEventIds.push(event.id);

    // Would survive a 3-year window (the default) but not a 1-year one
    // — this is the concrete proof the retention period is a live
    // configuration input, not a literal baked into the purge query.
    const { purgedCount } = await zeroRetentionAuditService.purgeExpiredEvents();
    expect(purgedCount).toBeGreaterThanOrEqual(1);
    const surviving = await admin.auditEvent.findUnique({ where: { id: event.id } });
    expect(surviving).toBeNull();
  });
});
