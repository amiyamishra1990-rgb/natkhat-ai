import { Inject, Injectable } from '@nestjs/common';
import { Child } from '@prisma/client';
import { ChildRepository } from '../identity-family/repositories/child.repository';
import { FamilyRepository } from '../identity-family/repositories/family.repository';
import { ParentRepository } from '../identity-family/repositories/parent.repository';
import { CoParentAssignmentRepository } from '../identity-family/repositories/co-parent-assignment.repository';
import { DeviceRepository } from '../identity-family/repositories/device.repository';
import { SessionRepository } from '../identity-family/repositories/session.repository';
import { AuditService } from '../audit/audit.service';
import { LeoLifecycleService } from '../leo/leo-lifecycle.service';
import { LIFECYCLE_CONFIG } from './lifecycle.config.provider';
import type { LifecycleConfig } from './lifecycle.config';
import { Role } from '../authorization/authorization.types';

/**
 * M16 (docs/sprints/sprint-03.md, §4; ADR-0015 §5–§7, §12–§13.1).
 * Soft-delete triggers (§7.1–§7.3), the co-parent-revocation and
 * session-ending cascades §7.2/§7.3 already specify (reusing the
 * repository methods those sections are built from, not inventing a
 * second cascade mechanism alongside session-lifecycle.service.ts's
 * §6.4 one), and the 90-day hard-delete sweep (§13.1, §6, §12) — as
 * testable service methods, per this milestone's own direction, not a
 * live cron job (no scheduler package exists in this repository).
 *
 * The caller is responsible for having already authorized the
 * request (AuthorizationService.authorize(...) for
 * family_account_deletion/manage_child_profile as appropriate) —
 * these methods perform the deletion once authorized, mirroring
 * session-lifecycle.service.ts's own "caller authorizes, this service
 * mutates" split. `actorRole` is the role AuthorizationService's
 * result already resolved, passed through rather than re-derived here.
 */
@Injectable()
export class LifecycleService {
  constructor(
    private readonly childRepository: ChildRepository,
    private readonly familyRepository: FamilyRepository,
    private readonly parentRepository: ParentRepository,
    private readonly coParentAssignmentRepository: CoParentAssignmentRepository,
    private readonly deviceRepository: DeviceRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly auditService: AuditService,
    private readonly leoLifecycleService: LeoLifecycleService,
    @Inject(LIFECYCLE_CONFIG) private readonly config: LifecycleConfig,
  ) {}

  /**
   * ADR-0015 §7.1 — soft-deletes the one Child row, plus (M18,
   * ai-memory-isolation.md §5.3) every Conversation/Message/LeoMemory
   * row for that Child — the cascade step §5.3's own table names for
   * "Parent deletes one Child profile," filled in now that those
   * entities exist.
   */
  async softDeleteChild(params: {
    childId: string;
    actorParentId: string;
    actorRole: Role;
  }): Promise<Child> {
    const child = await this.childRepository.softDelete(params.childId);
    await this.leoLifecycleService.cascadeSoftDeleteForChild(child.id);
    await this.auditService.record({
      eventType: 'child_deleted',
      actorPrincipalId: params.actorParentId,
      actorPrincipalType: 'Parent',
      actorRoleAtTime: params.actorRole,
      familyId: child.familyId,
      childId: child.id,
      targetType: 'Child',
      targetId: child.id,
    });
    return child;
  }

  /**
   * ADR-0015 §7.2 — soft-deletes the Family and cascades to every
   * active Child (soft-deleted), every active CoParentAssignment
   * (revoked, reusing the same repository call
   * session-lifecycle.service.ts's §6.4 cascade uses), and every
   * active Session pinned to this family_id (ended). Does not cascade
   * to Device, per §7.2's explicit "Device is Parent-scoped" carve-out
   * — no device repository call is made here at all.
   *
   * One `family_deleted` audit event is emitted, not one per cascaded
   * Child/CoParentAssignment — the cascade counts are recorded in its
   * metadata as a checklist, the same pattern §12's `deletion_completed`
   * event already uses, applied here to the soft-delete trigger too.
   * A direct, single-child deletion (softDeleteChild above) still gets
   * its own `child_deleted` event; a cascade-deleted child does not
   * get a second, redundant one.
   */
  async softDeleteFamily(params: {
    familyId: string;
    actorParentId: string;
    actorRole: Role;
  }): Promise<{
    familyId: string;
    childrenSoftDeleted: number;
    coParentAssignmentsRevoked: number;
    sessionsEnded: number;
    leoConversationsSoftDeleted: number;
    leoMessagesSoftDeleted: number;
    leoMemoriesSoftDeleted: number;
  }> {
    const family = await this.familyRepository.softDelete(params.familyId);

    const children = await this.childRepository.findActiveByFamilyId(family.id);
    for (const child of children) {
      await this.childRepository.softDelete(child.id);
    }

    const activeAssignments = await this.coParentAssignmentRepository.findActiveByFamilyId(
      family.id,
    );
    for (const assignment of activeAssignments) {
      await this.coParentAssignmentRepository.revoke(assignment.id, params.actorParentId);
    }

    const sessionsEnded = await this.sessionRepository.endActiveSessionsForFamily(
      family.id,
      'family_deleted',
    );

    // M18, ai-memory-isolation.md §5.3 — "every Conversation/Message
    // with that family_id... every LeoMemory row (all three classes,
    // including permanent_vault) with that family_id." One
    // family-scoped call, not one per Child — mirrors this method's
    // own existing per-family (not per-child) sessionsEnded call just
    // above.
    const leoCascade = await this.leoLifecycleService.cascadeSoftDeleteForFamily(family.id);

    await this.auditService.record({
      eventType: 'family_deleted',
      actorPrincipalId: params.actorParentId,
      actorPrincipalType: 'Parent',
      actorRoleAtTime: params.actorRole,
      familyId: family.id,
      targetType: 'Family',
      targetId: family.id,
      metadata: {
        childrenSoftDeleted: children.length,
        coParentAssignmentsRevoked: activeAssignments.length,
        sessionsEnded,
        leoConversationsSoftDeleted: leoCascade.conversations,
        leoMessagesSoftDeleted: leoCascade.messages,
        leoMemoriesSoftDeleted: leoCascade.memories,
      },
    });

    return {
      familyId: family.id,
      leoConversationsSoftDeleted: leoCascade.conversations,
      leoMessagesSoftDeleted: leoCascade.messages,
      leoMemoriesSoftDeleted: leoCascade.memories,
      childrenSoftDeleted: children.length,
      coParentAssignmentsRevoked: activeAssignments.length,
      sessionsEnded,
    };
  }

  /**
   * ADR-0015 §7.3 — the broadest cascade. Every Family this Parent
   * solely owns is deleted exactly as softDeleteFamily above (reused,
   * not duplicated); every Family where they are only a co_parent has
   * only their own CoParentAssignment revoked and their own sessions
   * for it ended — the Family, its owning Parent, and its Children are
   * untouched, per §7.3's explicit distinction. This Parent's own
   * Device inventory and remaining Sessions (across every Family) are
   * ended, then the Parent row itself is soft-deleted last, once every
   * cascade step that still needed the row's active status has run.
   *
   * `actorRoleAtTime` is deliberately omitted (left null) on the
   * `account_deleted` event — unlike child/family deletion, account
   * deletion is not evaluated against one specific family's role; a
   * Parent may hold `owner` for some families and `co_parent` for
   * others simultaneously (ADR-0008), so no single Role value would be
   * accurate here.
   */
  async softDeleteAccount(params: { parentId: string }): Promise<{
    parentId: string;
    ownedFamiliesDeleted: number;
    coParentAssignmentsRevoked: number;
    devicesRemoved: number;
    ownSessionsEnded: number;
  }> {
    const ownedFamilies = await this.familyRepository.findByOwningParentId(params.parentId);
    let ownedFamiliesDeleted = 0;
    for (const family of ownedFamilies) {
      if (family.status === 'deleted') {
        continue;
      }
      await this.softDeleteFamily({
        familyId: family.id,
        actorParentId: params.parentId,
        actorRole: 'owner',
      });
      ownedFamiliesDeleted += 1;
    }

    const coParentAssignments = await this.coParentAssignmentRepository.findActiveByParentId(
      params.parentId,
    );
    for (const assignment of coParentAssignments) {
      await this.coParentAssignmentRepository.revoke(assignment.id, params.parentId);
      await this.sessionRepository.endActiveSessionsForPrincipalInFamily(
        params.parentId,
        assignment.familyId,
        'account_deleted',
      );
    }

    const devices = await this.deviceRepository.findByParentId(params.parentId);
    for (const device of devices) {
      await this.deviceRepository.markDeleted(device.id);
    }

    const remainingSessions = await this.sessionRepository.findActiveByPrincipalId(params.parentId);
    for (const session of remainingSessions) {
      await this.sessionRepository.endSession(session.id, 'account_deleted');
    }

    const parent = await this.parentRepository.softDelete(params.parentId);

    await this.auditService.record({
      eventType: 'account_deleted',
      actorPrincipalId: parent.id,
      actorPrincipalType: 'Parent',
      targetType: 'Parent',
      targetId: parent.id,
      metadata: {
        ownedFamiliesDeleted,
        coParentAssignmentsRevoked: coParentAssignments.length,
        devicesRemoved: devices.length,
        ownSessionsEnded: remainingSessions.length,
      },
    });

    return {
      parentId: parent.id,
      ownedFamiliesDeleted,
      coParentAssignmentsRevoked: coParentAssignments.length,
      devicesRemoved: devices.length,
      ownSessionsEnded: remainingSessions.length,
    };
  }

  /**
   * ADR-0015 §13.1/§6/§12 — scans every soft-deleted, not-yet-
   * tombstoned Parent/Family/Child row whose hard-delete window has
   * elapsed, tombstones it (repository-layer `tombstone` methods —
   * content/PII fields scrubbed, id and status retained), and emits
   * one `deletion_completed` event per row, per §12's "a single Tier 5
   * 'deletion-completion' audit event referencing... the timestamp
   * each target completed."
   *
   * Crypto-shredding (§10, ADR-0015 Decision item 2; M18,
   * ai-memory-isolation.md §7.5) is the other named hard-delete
   * mechanism for Tier-3 content specifically — as of M18, a real
   * per-Family DEK exists (leo/leo-encryption.service.ts's dev-only
   * stopgap), so destroying that Family's FamilyEncryptionKey row here
   * (in the same loop as its Family tombstone, below) is now the real
   * mechanism, not a recorded gap. `recordDeletionCompleted`'s
   * `tier3CryptoShredding` metadata field is updated accordingly, per
   * this Family, in the loop below.
   *
   * `actorPrincipalId` is left null on every `deletion_completed`
   * event: this sweep is system-triggered (a scheduled/testable job),
   * not performed by a Parent or Child principal, and no "system"
   * principal type exists in this schema (`SessionPrincipalType` is
   * Parent | Child only) — the same kind of gap
   * audit-logging.md §7 already names for `share_link_accessed`'s
   * anonymous viewer, applied here to a different actorless case.
   */
  async runHardDeleteSweep(): Promise<{
    tombstonedChildren: number;
    tombstonedFamilies: number;
    tombstonedParents: number;
    leoTombstonedConversations: number;
    leoTombstonedMessages: number;
    leoTombstonedMemories: number;
    leoVersionHistoryExpired: number;
    familyDeksDestroyed: number;
  }> {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - this.config.softToHardDeleteDays);

    const [eligibleChildren, eligibleFamilies, eligibleParents] = await Promise.all([
      this.childRepository.findEligibleForHardDelete(cutoff),
      this.familyRepository.findEligibleForHardDelete(cutoff),
      this.parentRepository.findEligibleForHardDelete(cutoff),
    ]);

    for (const child of eligibleChildren) {
      await this.childRepository.tombstone(child.id);
      await this.recordDeletionCompleted({
        familyId: child.familyId,
        childId: child.id,
        targetType: 'Child',
        targetId: child.id,
        tier3CryptoShredding:
          'not_applicable — Child itself has no per-Child DEK (Family-scoped, §5.2)',
      });
    }

    let familyDeksDestroyed = 0;
    for (const family of eligibleFamilies) {
      await this.familyRepository.tombstone(family.id);
      // M18, ai-memory-isolation.md §7.5 — this Family completing
      // hard-delete is the named trigger for destroying its DEK,
      // irreversibly destroying every Conversation/Message/LeoMemory
      // row (including permanent_vault) still encrypted under it,
      // regardless of whether each of those rows has itself been
      // individually tombstoned yet.
      const dekDestroyed = await this.leoLifecycleService.destroyFamilyDek(family.id);
      if (dekDestroyed) {
        familyDeksDestroyed += 1;
      }
      await this.recordDeletionCompleted({
        familyId: family.id,
        targetType: 'Family',
        targetId: family.id,
        tier3CryptoShredding: dekDestroyed
          ? 'destroyed — FamilyEncryptionKey row deleted, per §7.5'
          : 'not_applicable — no FamilyEncryptionKey row existed for this Family (no Tier-3 content was ever written)',
      });
    }

    for (const parent of eligibleParents) {
      await this.parentRepository.tombstone(parent.id);
      await this.recordDeletionCompleted({
        targetType: 'Parent',
        targetId: parent.id,
        tier3CryptoShredding:
          'not_applicable — Parent itself has no per-Parent DEK (Family-scoped, §5.2)',
      });
    }

    // M18, ai-memory-isolation.md §5.2/§6 — the same 90-day window,
    // applied to Conversation/Message/LeoMemory rows individually
    // (independent of whether their owning Family has itself reached
    // hard-delete yet).
    const leoSweep = await this.leoLifecycleService.runHardDeleteSweep(cutoff);
    // §5.4 — version_history's own independent aging, on its own
    // configurable window, not the generic 90-day one above.
    const versionHistorySweep = await this.leoLifecycleService.runVersionHistoryExpirySweep();

    return {
      tombstonedChildren: eligibleChildren.length,
      tombstonedFamilies: eligibleFamilies.length,
      tombstonedParents: eligibleParents.length,
      leoTombstonedConversations: leoSweep.tombstonedConversations,
      leoTombstonedMessages: leoSweep.tombstonedMessages,
      leoTombstonedMemories: leoSweep.tombstonedMemories,
      leoVersionHistoryExpired: versionHistorySweep.expired,
      familyDeksDestroyed,
    };
  }

  private async recordDeletionCompleted(target: {
    familyId?: string;
    childId?: string;
    targetType: 'Child' | 'Family' | 'Parent';
    targetId: string;
    tier3CryptoShredding: string;
  }): Promise<void> {
    await this.auditService.record({
      eventType: 'deletion_completed',
      familyId: target.familyId ?? null,
      childId: target.childId ?? null,
      targetType: target.targetType,
      targetId: target.targetId,
      metadata: {
        tombstonedAt: new Date().toISOString(),
        cascadeTargets: {
          contentFieldsScrubbed: true,
          tier3CryptoShredding: target.tier3CryptoShredding,
        },
      },
    });
  }
}
