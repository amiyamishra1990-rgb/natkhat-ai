import { Inject, Injectable } from '@nestjs/common';
import {
  AuditActorRole,
  AuditEvent,
  AuditEventType,
  AuditTargetType,
  Prisma,
  SessionPrincipalType,
} from '@prisma/client';
import { AUDIT_PRISMA_CLIENT } from '../prisma-client.provider';
import type { PrismaClientLike } from './types';

// M16 (docs/sprints/sprint-03.md, §4;
// docs/architecture/audit-logging.md §3). Repository-layer only, no
// API surface — same convention every M14/M15 repository already
// follows. Never exposes an update/delete-a-single-event method:
// Tier 5 is append-only (ADR-0006 §22) — the only removal path is
// purgeExpired below, a bulk, retention-driven sweep, not a per-row
// mutation.
@Injectable()
export class AuditEventRepository {
  constructor(@Inject(AUDIT_PRISMA_CLIENT) private readonly prisma: PrismaClientLike) {}

  create(data: {
    id?: string;
    eventType: AuditEventType;
    actorPrincipalId?: string | null;
    actorPrincipalType?: SessionPrincipalType | null;
    actorRoleAtTime?: AuditActorRole | null;
    familyId?: string | null;
    childId?: string | null;
    targetType: AuditTargetType;
    targetId?: string | null;
    metadata?: Prisma.InputJsonValue;
  }): Promise<AuditEvent> {
    return this.prisma.auditEvent.create({ data });
  }

  findMany(): Promise<AuditEvent[]> {
    return this.prisma.auditEvent.findMany();
  }

  // audit-logging.md §7 — "visible to the parent who created it"
  // (share_link_accessed) and every other family-scoped event.
  findByFamilyId(familyId: string): Promise<AuditEvent[]> {
    return this.prisma.auditEvent.findMany({ where: { familyId } });
  }

  // A parent's own actions, including family-less events like
  // account_deleted.
  findByActorPrincipalId(actorPrincipalId: string): Promise<AuditEvent[]> {
    return this.prisma.auditEvent.findMany({ where: { actorPrincipalId } });
  }

  // data-lifecycle.md §11 / audit-logging.md §9 — Tier 5 is "governed
  // by its own, independently bounded retention duration... not an
  // indefinite one." Physical deletion (not tombstone) is correct
  // here specifically because audit rows are already content-free by
  // design (audit-logging.md §10) — there is no PII to scrub, only
  // rows to remove once their retention window elapses.
  async purgeExpired(cutoff: Date): Promise<number> {
    const result = await this.prisma.auditEvent.deleteMany({
      where: { occurredAt: { lt: cutoff } },
    });
    return result.count;
  }
}
