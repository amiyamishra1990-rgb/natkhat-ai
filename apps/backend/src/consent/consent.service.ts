import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { Child, ConsentEvent, ConsentType, PrismaClient } from '@prisma/client';
import { LifecycleService } from '../lifecycle/lifecycle.service';
import { ConsentEventRepository } from './repositories/consent-event.repository';
import { CONSENT_PRISMA_CLIENT } from './prisma-client.provider';
import { CONSENT_CONFIG } from './consent.config.provider';
import type { ConsentConfig } from './consent.config';

export class ConsentTrackADisabledError extends Error {
  constructor() {
    super(
      'Consent Track A is disabled — set CONSENT_TRACK_A_ENABLED=true to enable it (Sprint 03: legally-gated functionality must never default to enabled).',
    );
    this.name = 'ConsentTrackADisabledError';
  }
}

/**
 * M17 — Consent & Privacy Gate, Track A scaffold only
 * (docs/sprints/sprint-03.md, §4; ADR-0011;
 * docs/architecture/consent-architecture.md §3-§7). Every method
 * refuses to run unless `CONSENT_TRACK_A_ENABLED=true` — see
 * consent.config.ts.
 *
 * No `AuditService` call anywhere in this class: audit-logging.md §5
 * is explicit that `ConsentEvent` must **not** get a duplicate Tier-5
 * row — it already "supplies the actor/event fields Milestone 7's
 * general audit-log schema will reference," an invitation to
 * reference, not duplicate. This is a deliberate omission, not a gap.
 */
@Injectable()
export class ConsentService {
  constructor(
    @Inject(CONSENT_PRISMA_CLIENT) private readonly prisma: PrismaClient,
    private readonly consentEventRepository: ConsentEventRepository,
    private readonly lifecycleService: LifecycleService,
    @Inject(CONSENT_CONFIG) private readonly config: ConsentConfig,
  ) {}

  private assertEnabled(): void {
    if (!this.config.trackAEnabled) {
      throw new ConsentTrackADisabledError();
    }
  }

  /**
   * ADR-0011 Decision item 2 / consent-architecture.md §4 — atomic
   * co-creation: no state where a Child exists without its founding
   * ConsentEvent. The shared id is generated up front (the same
   * optional-`id` pattern child.repository.ts's own `create()` already
   * accepts) so both rows can be inserted in one transaction
   * referencing the same identifier, rather than one insert waiting on
   * a DB-generated id from the other.
   *
   * Uses this module's own raw PrismaClient directly
   * (`$transaction`/`tx.child`/`tx.consentEvent`), not
   * identity-family's `ChildRepository` or this module's own
   * `ConsentEventRepository` — neither is bound to a client that can
   * participate in a transaction opened from outside itself. Any
   * PrismaClient instance connected to this same physical database can
   * still provide real cross-table atomicity here — see
   * prisma-client.provider.ts's comment.
   *
   * `verificationMethod`/`verificationReference` stay whatever the
   * caller passes (normally omitted/undefined in this milestone — no
   * verification mechanism is selected or implemented, §8/§12); this
   * method does not populate, validate, or default them.
   */
  async createChildWithFoundingConsent(params: {
    familyId: string;
    createdByParentId: string;
    firstName: string;
    dateOfBirth: Date;
    avatarRef?: string;
    consentingParentId: string;
    privacyTermsVersion: string;
    verificationMethod?: string;
    verificationReference?: string;
    ipAddressHash?: string;
  }): Promise<{ child: Child; consentEvent: ConsentEvent }> {
    this.assertEnabled();

    const childId = randomUUID();
    return this.prisma.$transaction(async (tx) => {
      const child = await tx.child.create({
        data: {
          id: childId,
          familyId: params.familyId,
          firstName: params.firstName,
          dateOfBirth: params.dateOfBirth,
          avatarRef: params.avatarRef,
          createdByParentId: params.createdByParentId,
        },
      });
      const consentEvent = await tx.consentEvent.create({
        data: {
          familyId: params.familyId,
          childId,
          consentingParentId: params.consentingParentId,
          consentType: 'child_account_creation',
          action: 'granted',
          privacyTermsVersion: params.privacyTermsVersion,
          verificationMethod: params.verificationMethod,
          verificationReference: params.verificationReference,
          ipAddressHash: params.ipAddressHash,
        },
      });
      return { child, consentEvent };
    });
  }

  /**
   * §5.2 — withdrawal reuses M16's Child soft-delete cascade rather
   * than a second deletion pathway, then records the withdrawal as a
   * new, append-only row (§5.1 — never a mutation of the founding
   * event). Not wrapped in the same transaction
   * `createChildWithFoundingConsent` uses: §5.2 does not specify
   * transactional atomicity for withdrawal the way §4 does for
   * creation, and lifecycle.service.ts's own cascades are themselves
   * already a sequence of independent, non-transactional steps — this
   * matches that established style rather than introducing a new one
   * for just this path.
   *
   * `actorRole: 'owner'` is unconditional, mirroring
   * session-lifecycle.service.ts's identical reasoning for
   * `revokeCoParentAssignment`: §5.4 makes every consent *change*
   * action owner-only by construction, so only an owner-authorized
   * caller ever reaches this line.
   */
  async withdrawConsent(params: {
    childId: string;
    familyId: string;
    consentingParentId: string;
    privacyTermsVersion: string;
  }): Promise<ConsentEvent> {
    this.assertEnabled();

    await this.lifecycleService.softDeleteChild({
      childId: params.childId,
      actorParentId: params.consentingParentId,
      actorRole: 'owner',
    });

    return this.consentEventRepository.create({
      familyId: params.familyId,
      childId: params.childId,
      consentingParentId: params.consentingParentId,
      consentType: 'child_account_creation',
      action: 'withdrawn',
      privacyTermsVersion: params.privacyTermsVersion,
    });
  }

  /**
   * §5.3 — records a renewal outcome only; no detection mechanism or
   * parent-facing renewal flow (explicitly out of scope, §12).
   */
  async recordRenewal(params: {
    familyId: string;
    childId?: string;
    consentingParentId: string;
    consentType: ConsentType;
    privacyTermsVersion: string;
  }): Promise<ConsentEvent> {
    this.assertEnabled();

    return this.consentEventRepository.create({
      familyId: params.familyId,
      childId: params.childId,
      consentingParentId: params.consentingParentId,
      consentType: params.consentType,
      action: 'renewed',
      privacyTermsVersion: params.privacyTermsVersion,
    });
  }
}
