import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { FamilyRepository } from '../identity-family/repositories/family.repository';
import { ChildRepository } from '../identity-family/repositories/child.repository';
import { ParentRepository } from '../identity-family/repositories/parent.repository';
import { DeviceRepository } from '../identity-family/repositories/device.repository';
import { SessionRepository } from '../identity-family/repositories/session.repository';
import { CoParentAssignmentRepository } from '../identity-family/repositories/co-parent-assignment.repository';
import { AuditEventRepository } from '../audit/repositories/audit-event.repository';
import { AuditService } from '../audit/audit.service';
import { serializePermissionScope } from '../authorization/permission-scope';
import { ExportService, ParentNotFoundError } from './export.service';

// M16 — Integration (docs/sprints/sprint-03.md, §4; ADR-0015 §8).
describe('ExportService — M16', () => {
  const admin = new PrismaClient();
  const familyRepository = new FamilyRepository(admin);
  const childRepository = new ChildRepository(admin);
  const parentRepository = new ParentRepository(admin);
  const deviceRepository = new DeviceRepository(admin);
  const sessionRepository = new SessionRepository(admin);
  const coParentAssignmentRepository = new CoParentAssignmentRepository(admin);
  const auditEventRepository = new AuditEventRepository(admin);
  const auditService = new AuditService(auditEventRepository, { tier5RetentionYears: 3 });
  const exportService = new ExportService(
    familyRepository,
    childRepository,
    parentRepository,
    deviceRepository,
    sessionRepository,
    coParentAssignmentRepository,
    auditService,
  );

  const owner = { id: randomUUID() };
  const coParent = { id: randomUUID() };
  const family = { id: randomUUID() };
  const child = { id: randomUUID() };
  const ownerDevice = { id: randomUUID() };

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
        displayName: 'Fictional Co-Parent — Should Never Appear In Owner Export',
        contactEmail: `co-parent-${coParent.id}@example.invalid`,
      },
    });
    await admin.family.create({
      data: { id: family.id, owningParentId: owner.id, displayName: 'Fictional Family' },
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
    await admin.coParentAssignment.create({
      data: {
        familyId: family.id,
        parentId: coParent.id,
        invitedByParentId: owner.id,
        permissionScope: serializePermissionScope(['view_child_profile']),
      },
    });
    await admin.device.create({
      data: {
        id: ownerDevice.id,
        parentId: owner.id,
        deviceLabel: "Owner's fictional tablet",
        deviceType: 'tablet',
        status: 'active',
      },
    });
    await sessionRepository.create({
      principalId: owner.id,
      principalType: 'Parent',
      familyId: family.id,
      deviceId: ownerDevice.id,
    });
  });

  afterAll(async () => {
    await admin.auditEvent.deleteMany({ where: { familyId: family.id } });
    await admin.auditEvent.deleteMany({
      where: { actorPrincipalId: { in: [owner.id, coParent.id] } },
    });
    await admin.session.deleteMany({ where: { familyId: family.id } });
    await admin.device.deleteMany({ where: { parentId: { in: [owner.id, coParent.id] } } });
    await admin.coParentAssignment.deleteMany({ where: { familyId: family.id } });
    await admin.child.deleteMany({ where: { familyId: family.id } });
    await admin.family.deleteMany({ where: { id: family.id } });
    await admin.parent.deleteMany({ where: { id: { in: [owner.id, coParent.id] } } });
    await admin.$disconnect();
  });

  it('an owner export includes family-scoped content plus their own account data, and records data_export_requested', async () => {
    const bundle = await exportService.exportForParent(owner.id);

    expect(bundle.parent.id).toBe(owner.id);
    expect(bundle.families).toHaveLength(1);
    expect(bundle.families[0]?.familyId).toBe(family.id);
    expect(bundle.families[0]?.children.map((c) => c.id)).toEqual([child.id]);
    expect(bundle.devices.map((d) => d.id)).toEqual([ownerDevice.id]);
    expect(bundle.sessions).toHaveLength(1);

    const events = await admin.auditEvent.findMany({
      where: { eventType: 'data_export_requested', actorPrincipalId: owner.id },
    });
    expect(events).toHaveLength(1);
    expect(events[0]?.actorRoleAtTime).toBe('owner');
  });

  it('a co-parent export excludes family-scoped content for a family they do not own (data_export is owner-only, ADR-0009)', async () => {
    const bundle = await exportService.exportForParent(coParent.id);
    expect(bundle.families).toHaveLength(0);
  });

  it("the owner export's co-parent-assignment entries never expose the co-parent's own Parent-row fields (conservative reading of §8's flagged gap)", async () => {
    const bundle = await exportService.exportForParent(owner.id);
    const assignments = bundle.families[0]?.coParentAssignments ?? [];
    expect(assignments).toHaveLength(1);
    expect(assignments[0]?.coParentId).toBe(coParent.id);

    const serialized = JSON.stringify(assignments);
    expect(serialized).not.toContain('Should Never Appear In Owner Export');
    expect(serialized).not.toContain(`co-parent-${coParent.id}@example.invalid`);
  });

  it('throws for an unknown parent id rather than returning an empty bundle', async () => {
    await expect(exportService.exportForParent(randomUUID())).rejects.toThrow(ParentNotFoundError);
  });
});
