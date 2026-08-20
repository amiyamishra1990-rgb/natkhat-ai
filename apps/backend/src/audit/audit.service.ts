import { Inject, Injectable } from '@nestjs/common';
import {
  AuditActorRole,
  AuditEvent,
  AuditEventType,
  AuditTargetType,
  Prisma,
  SessionPrincipalType,
} from '@prisma/client';
import { AuditEventRepository } from './repositories/audit-event.repository';
import { AUDIT_CONFIG } from './audit.config.provider';
import type { AuditConfig } from './audit.config';

export interface RecordAuditEventParams {
  eventType: AuditEventType;
  actorPrincipalId?: string | null;
  actorPrincipalType?: SessionPrincipalType | null;
  actorRoleAtTime?: AuditActorRole | null;
  familyId?: string | null;
  childId?: string | null;
  targetType: AuditTargetType;
  targetId?: string | null;
  metadata?: Prisma.InputJsonValue;
}

/**
 * M16 (docs/sprints/sprint-03.md, §4;
 * docs/architecture/audit-logging.md). One small service, not a
 * framework — a single `record` method plus the retention-driven
 * purge, matching the "deliberately a single small service"
 * precedent authorization.service.ts already set for this
 * repository. Every caller (lifecycle.service.ts, export.service.ts,
 * session-lifecycle.service.ts) already knows its own event's fields
 * from the operation it just performed; this service does not
 * re-derive actor/role/target from other state, it only persists what
 * it is given, append-only.
 */
@Injectable()
export class AuditService {
  constructor(
    private readonly auditEventRepository: AuditEventRepository,
    @Inject(AUDIT_CONFIG) private readonly config: AuditConfig,
  ) {}

  record(params: RecordAuditEventParams): Promise<AuditEvent> {
    return this.auditEventRepository.create(params);
  }

  /**
   * data-lifecycle.md §11 / audit-logging.md §9 — Tier 5's own,
   * independently bounded retention window (ADR-0015 §13.3, currently
   * 3 years, APPROVED PROVISIONALLY). A testable service method, not
   * a live cron trigger — no scheduler package exists in this
   * repository yet, and Sprint 03's Track A scope is proving the
   * mechanism against synthetic data, not standing up production job
   * infrastructure.
   */
  async purgeExpiredEvents(): Promise<{ purgedCount: number }> {
    const cutoff = new Date();
    cutoff.setUTCFullYear(cutoff.getUTCFullYear() - this.config.tier5RetentionYears);
    const purgedCount = await this.auditEventRepository.purgeExpired(cutoff);
    return { purgedCount };
  }
}
