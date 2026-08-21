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
import { LifecycleService } from '../lifecycle/lifecycle.service';
import { ConsentEventRepository } from './repositories/consent-event.repository';
import { ConsentService, ConsentTrackADisabledError } from './consent.service';

// M17 — Integration (docs/sprints/sprint-03.md, §4; ADR-0011;
// docs/architecture/consent-architecture.md §4-§5.3). Same live-Postgres
// pattern as lifecycle.service.integration.spec.ts: admin/migration
// client only, not testing RLS here (that is
// consent-tenant-isolation.integration.spec.ts's job).
describe('ConsentService — M17', () => {
  const admin = new PrismaClient();
  const childRepository = new ChildRepository(admin);
  const familyRepository = new FamilyRepository(admin);
  const parentRepository = new ParentRepository(admin);
  const coParentAssignmentRepository = new CoParentAssignmentRepository(admin);
  const deviceRepository = new DeviceRepository(admin);
  const sessionRepository = new SessionRepository(admin);
  const auditEventRepository = new AuditEventRepository(admin);
  const auditService = new AuditService(auditEventRepository, { tier5RetentionYears: 3 });
  const lifecycleService = new LifecycleService(
    childRepository,
    familyRepository,
    parentRepository,
    coParentAssignmentRepository,
    deviceRepository,
    sessionRepository,
    auditService,
    { softToHardDeleteDays: 90, backupPurgeDays: 90 },
  );
  const consentEventRepository = new ConsentEventRepository(admin);

  const disabledConsentService = new ConsentService(
    admin,
    consentEventRepository,
    lifecycleService,
    { trackAEnabled: false },
  );
  const enabledConsentService = new ConsentService(
    admin,
    consentEventRepository,
    lifecycleService,
    { trackAEnabled: true },
  );

  const owner = { id: randomUUID() };
  const family = { id: randomUUID() };
  const emptyFamily = { id: randomUUID() };

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
      data: { id: family.id, owningParentId: owner.id, displayName: 'Fictional Family' },
    });
    await admin.family.create({
      data: { id: emptyFamily.id, owningParentId: owner.id, displayName: 'Fictional Empty Family' },
    });
  });

  afterAll(async () => {
    await admin.consentEvent.deleteMany({
      where: { familyId: { in: [family.id, emptyFamily.id] } },
    });
    await admin.auditEvent.deleteMany({ where: { familyId: { in: [family.id, emptyFamily.id] } } });
    await admin.child.deleteMany({ where: { familyId: { in: [family.id, emptyFamily.id] } } });
    await admin.family.deleteMany({ where: { id: { in: [family.id, emptyFamily.id] } } });
    await admin.parent.deleteMany({ where: { id: owner.id } });
    await admin.$disconnect();
  });

  it('every write path refuses to run when CONSENT_TRACK_A_ENABLED is not true — default-off, per Sprint 03', async () => {
    await expect(
      disabledConsentService.createChildWithFoundingConsent({
        familyId: family.id,
        createdByParentId: owner.id,
        firstName: 'Fictional Child',
        dateOfBirth: new Date('2019-06-01'),
        consentingParentId: owner.id,
        privacyTermsVersion: 'fictional-terms-v1',
      }),
    ).rejects.toThrow(ConsentTrackADisabledError);

    await expect(
      disabledConsentService.withdrawConsent({
        childId: randomUUID(),
        familyId: family.id,
        consentingParentId: owner.id,
        privacyTermsVersion: 'fictional-terms-v1',
      }),
    ).rejects.toThrow(ConsentTrackADisabledError);

    await expect(
      disabledConsentService.recordRenewal({
        familyId: family.id,
        consentingParentId: owner.id,
        consentType: 'privacy_terms_update',
        privacyTermsVersion: 'fictional-terms-v2',
      }),
    ).rejects.toThrow(ConsentTrackADisabledError);
  });

  it('createChildWithFoundingConsent (§4) creates a Child and its founding ConsentEvent atomically, sharing one id', async () => {
    const { child, consentEvent } = await enabledConsentService.createChildWithFoundingConsent({
      familyId: family.id,
      createdByParentId: owner.id,
      firstName: 'Fictional Child',
      dateOfBirth: new Date('2019-06-01'),
      consentingParentId: owner.id,
      privacyTermsVersion: 'fictional-terms-v1',
    });

    expect(consentEvent.childId).toBe(child.id);
    expect(consentEvent.familyId).toBe(family.id);
    expect(consentEvent.consentType).toBe('child_account_creation');
    expect(consentEvent.action).toBe('granted');
    // §3/§8 — no verification mechanism is selected; this milestone's
    // Track-A code never populates it.
    expect(consentEvent.verificationMethod).toBeNull();

    const persistedChild = await admin.child.findUnique({ where: { id: child.id } });
    const persistedConsentEvent = await admin.consentEvent.findUnique({
      where: { id: consentEvent.id },
    });
    expect(persistedChild).not.toBeNull();
    expect(persistedConsentEvent?.childId).toBe(persistedChild?.id);
  });

  it('a failed atomic creation rolls back completely — no orphan Child, no orphan ConsentEvent (proves the invariant, not just the happy path)', async () => {
    await expect(
      enabledConsentService.createChildWithFoundingConsent({
        familyId: emptyFamily.id,
        createdByParentId: owner.id,
        firstName: 'Fictional Child Whose Consent Event Fails',
        dateOfBirth: new Date('2020-01-01'),
        // A consentingParentId that does not exist violates
        // consent_event's FK on the *second* insert inside the
        // transaction — the whole transaction, including the already-
        // attempted child insert, must roll back.
        consentingParentId: randomUUID(),
        privacyTermsVersion: 'fictional-terms-v1',
      }),
    ).rejects.toThrow();

    const orphanChildren = await admin.child.findMany({ where: { familyId: emptyFamily.id } });
    const orphanConsentEvents = await admin.consentEvent.findMany({
      where: { familyId: emptyFamily.id },
    });
    expect(orphanChildren).toHaveLength(0);
    expect(orphanConsentEvents).toHaveLength(0);
  });

  it('withdrawConsent (§5.2) reuses the M16 Child soft-delete cascade and appends an append-only withdrawn event', async () => {
    const { child } = await enabledConsentService.createChildWithFoundingConsent({
      familyId: family.id,
      createdByParentId: owner.id,
      firstName: 'Fictional Child To Withdraw',
      dateOfBirth: new Date('2021-03-01'),
      consentingParentId: owner.id,
      privacyTermsVersion: 'fictional-terms-v1',
    });

    const withdrawalEvent = await enabledConsentService.withdrawConsent({
      childId: child.id,
      familyId: family.id,
      consentingParentId: owner.id,
      privacyTermsVersion: 'fictional-terms-v1',
    });

    expect(withdrawalEvent.action).toBe('withdrawn');
    expect(withdrawalEvent.childId).toBe(child.id);

    const softDeletedChild = await admin.child.findUnique({ where: { id: child.id } });
    expect(softDeletedChild?.status).toBe('deleted');
    expect(softDeletedChild?.deletedAt).not.toBeNull();

    // §5.1 — append-only: the founding `granted` row is untouched, not
    // overwritten by the withdrawal.
    const allEventsForChild = await admin.consentEvent.findMany({ where: { childId: child.id } });
    expect(allEventsForChild.map((event) => event.action).sort()).toEqual(['granted', 'withdrawn']);
  });

  it('recordRenewal (§5.3) appends a new event without touching any Child row', async () => {
    const renewalEvent = await enabledConsentService.recordRenewal({
      familyId: family.id,
      consentingParentId: owner.id,
      consentType: 'privacy_terms_update',
      privacyTermsVersion: 'fictional-terms-v2',
    });

    expect(renewalEvent.action).toBe('renewed');
    expect(renewalEvent.consentType).toBe('privacy_terms_update');
    expect(renewalEvent.childId).toBeNull();
  });
});
