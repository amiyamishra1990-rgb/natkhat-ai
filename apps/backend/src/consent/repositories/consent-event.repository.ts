import { Inject, Injectable } from '@nestjs/common';
import { ConsentAction, ConsentEvent, ConsentType } from '@prisma/client';
import { CONSENT_PRISMA_CLIENT } from '../prisma-client.provider';
import type { PrismaClientLike } from './types';

// M17 (docs/sprints/sprint-03.md, §4;
// docs/architecture/consent-architecture.md §3, §5.1). Repository-layer
// only, no API surface — same convention every M14-M16 repository
// follows. Never exposes an update/delete-a-single-event method: §5.1
// is explicit that a ConsentEvent row is "never updated in place and
// never deleted by a parent" — a change in consent state is always a
// new row (consent.service.ts's withdrawConsent/recordRenewal), never
// a mutation.
//
// Not used by consent.service.ts's atomic Child+ConsentEvent
// co-creation path (createChildWithFoundingConsent) — that path needs
// a `$transaction` spanning the `child` table too, which this
// repository's own bound client cannot participate in from outside;
// see that service method's own comment. This repository is used for
// every other ConsentEvent write (withdrawal, renewal) and for reads.
@Injectable()
export class ConsentEventRepository {
  constructor(@Inject(CONSENT_PRISMA_CLIENT) private readonly prisma: PrismaClientLike) {}

  create(data: {
    id?: string;
    familyId: string;
    childId?: string | null;
    consentingParentId: string;
    consentType: ConsentType;
    action: ConsentAction;
    privacyTermsVersion: string;
    verificationMethod?: string | null;
    verificationReference?: string | null;
    ipAddressHash?: string | null;
  }): Promise<ConsentEvent> {
    return this.prisma.consentEvent.create({ data });
  }

  findMany(): Promise<ConsentEvent[]> {
    return this.prisma.consentEvent.findMany();
  }

  findByFamilyId(familyId: string): Promise<ConsentEvent[]> {
    return this.prisma.consentEvent.findMany({ where: { familyId } });
  }

  findByChildId(childId: string): Promise<ConsentEvent[]> {
    return this.prisma.consentEvent.findMany({ where: { childId } });
  }

  // consent-architecture.md §5.1: "The current effective consent state
  // for a (family_id, child_id, consent_type) tuple is derived by
  // reading the most recent row, not stored redundantly elsewhere."
  findLatest(params: {
    familyId: string;
    childId: string;
    consentType: ConsentType;
  }): Promise<ConsentEvent | null> {
    return this.prisma.consentEvent.findFirst({
      where: {
        familyId: params.familyId,
        childId: params.childId,
        consentType: params.consentType,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
