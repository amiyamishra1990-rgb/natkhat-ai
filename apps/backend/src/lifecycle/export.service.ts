import { Injectable } from '@nestjs/common';
import { FamilyRepository } from '../identity-family/repositories/family.repository';
import { ChildRepository } from '../identity-family/repositories/child.repository';
import { ParentRepository } from '../identity-family/repositories/parent.repository';
import { DeviceRepository } from '../identity-family/repositories/device.repository';
import { SessionRepository } from '../identity-family/repositories/session.repository';
import { CoParentAssignmentRepository } from '../identity-family/repositories/co-parent-assignment.repository';
import { AuditService } from '../audit/audit.service';

export class ParentNotFoundError extends Error {
  constructor(parentId: string) {
    super(`Parent ${parentId} not found`);
    this.name = 'ParentNotFoundError';
  }
}

export interface ExportBundle {
  parent: { id: string; displayName: string; contactEmail: string; createdAt: Date };
  families: Array<{
    familyId: string;
    displayName: string;
    children: Array<{
      id: string;
      firstName: string;
      dateOfBirth: Date;
      avatarRef: string | null;
    }>;
    coParentAssignments: Array<{
      id: string;
      coParentId: string;
      permissionScope: string;
      status: string;
      createdAt: Date;
    }>;
  }>;
  devices: Array<{
    id: string;
    deviceLabel: string;
    deviceType: string;
    status: string;
    firstSeenAt: Date;
    lastSeenAt: Date;
  }>;
  sessions: Array<{
    id: string;
    familyId: string;
    startedAt: Date;
    lastActiveAt: Date;
    endedAt: Date | null;
    endReason: string | null;
  }>;
}

/**
 * M16 (docs/sprints/sprint-03.md, §4; ADR-0015 §8). Export
 * completeness per §8: every record visible to the requesting Parent
 * through the future Privacy Dashboard, for every Family they are
 * authorized for — Child profile data, their own Device list, their
 * own Session/login history, and active CoParentAssignment grants.
 *
 * **Implementation-stage reading, documented per this repository's
 * flag-don't-silently-resolve discipline (same as the M15
 * permission-scope correction):** `data_export` is one of ADR-0009's
 * five hard-invariant owner-only actions
 * (authorization/authorization.types.ts) — a co-parent cannot invoke
 * export for a family at all, even though they can view its content
 * day-to-day. §8's "every Family they are authorized for" is
 * therefore read here as "every Family they are authorized for *as
 * owner*" (family-scoped content is included only for
 * `familyRepository.findByOwningParentId`, not the full co-parent-
 * inclusive authorized set authorization.service.ts's tenant-scope
 * gate resolves) — the alternative reading would let a co-parent
 * bulk-export a family's child data through this export path despite
 * being hard-denied the `data_export` action itself, which this
 * service does not do. The Parent's own account-level data (profile,
 * devices, every session across every family, regardless of role) is
 * always included, since that is unambiguously their own data.
 *
 * **Co-parent field-visibility gap (§8's own flagged item, resolved
 * conservatively per this milestone's direction — "only what they'd
 * already see"):** `coParentAssignments` below returns only the
 * assignment row's own fields (an opaque `coParentId`, the
 * permission_scope, status, timestamps) — never a join into a
 * different co-parent's own `Parent` row (display name, contact
 * email). §8 explicitly flags that "full contact details of a
 * different principal are not automatically export-safe just because
 * they relate to the same Family" and leaves the exact rule to
 * implementation time; this is the conservative resolution, not the
 * only defensible one.
 */
@Injectable()
export class ExportService {
  constructor(
    private readonly familyRepository: FamilyRepository,
    private readonly childRepository: ChildRepository,
    private readonly parentRepository: ParentRepository,
    private readonly deviceRepository: DeviceRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly coParentAssignmentRepository: CoParentAssignmentRepository,
    private readonly auditService: AuditService,
  ) {}

  async exportForParent(parentId: string): Promise<ExportBundle> {
    const parent = await this.parentRepository.findById(parentId);
    if (!parent) {
      throw new ParentNotFoundError(parentId);
    }

    const ownedFamilies = await this.familyRepository.findByOwningParentId(parentId);
    const families = await Promise.all(
      ownedFamilies.map(async (family) => {
        const [children, activeCoParentAssignments] = await Promise.all([
          this.childRepository.findActiveByFamilyId(family.id),
          this.coParentAssignmentRepository.findActiveByFamilyId(family.id),
        ]);
        return {
          familyId: family.id,
          displayName: family.displayName,
          children: children.map((child) => ({
            id: child.id,
            firstName: child.firstName,
            dateOfBirth: child.dateOfBirth,
            avatarRef: child.avatarRef,
          })),
          coParentAssignments: activeCoParentAssignments.map((assignment) => ({
            id: assignment.id,
            coParentId: assignment.parentId,
            permissionScope: assignment.permissionScope,
            status: assignment.status,
            createdAt: assignment.createdAt,
          })),
        };
      }),
    );

    const [devices, sessions] = await Promise.all([
      this.deviceRepository.findByParentId(parentId),
      this.sessionRepository.findByPrincipalId(parentId),
    ]);

    await this.auditService.record({
      eventType: 'data_export_requested',
      actorPrincipalId: parentId,
      actorPrincipalType: 'Parent',
      actorRoleAtTime: 'owner',
      targetType: 'Export',
      metadata: { familyCount: families.length },
    });

    return {
      parent: {
        id: parent.id,
        displayName: parent.displayName,
        contactEmail: parent.contactEmail,
        createdAt: parent.createdAt,
      },
      families,
      devices: devices.map((device) => ({
        id: device.id,
        deviceLabel: device.deviceLabel,
        deviceType: device.deviceType,
        status: device.status,
        firstSeenAt: device.firstSeenAt,
        lastSeenAt: device.lastSeenAt,
      })),
      sessions: sessions.map((session) => ({
        id: session.id,
        familyId: session.familyId,
        startedAt: session.startedAt,
        lastActiveAt: session.lastActiveAt,
        endedAt: session.endedAt,
        endReason: session.endReason,
      })),
    };
  }
}
