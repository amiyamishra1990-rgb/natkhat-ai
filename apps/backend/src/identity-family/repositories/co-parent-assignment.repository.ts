import { Inject, Injectable } from '@nestjs/common';
import { CoParentAssignment } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma-client.provider';
import type { PrismaClientLike } from './types';

// module doc §3.5. No API surface (M14 exclusion) — repository-layer
// only, consumed by tests directly and by future NestJS providers.
// permissionScope is a bounded-but-not-yet-enumerated field (see
// prisma/schema.prisma's comment) — accepted here as a plain string,
// not validated against a concrete set, per this milestone's scope.
@Injectable()
export class CoParentAssignmentRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClientLike) {}

  create(data: {
    id?: string;
    familyId: string;
    parentId: string;
    invitedByParentId: string;
    permissionScope: string;
  }): Promise<CoParentAssignment> {
    return this.prisma.coParentAssignment.create({ data });
  }

  findMany(): Promise<CoParentAssignment[]> {
    return this.prisma.coParentAssignment.findMany();
  }

  // M15 (docs/sprints/sprint-03.md, §4; ADR-0009 §4 step 1) — resolves
  // the "co_parent" half of a Parent's authorized-family set. Only
  // `active` assignments count: ADR-0009, Decision item 6 requires the
  // tenant-scope gate to "re-resolve the authorized family set from
  // current CoParentAssignment.status on every request," so a revoked
  // assignment must never be returned here regardless of cache/timing.
  findActiveByParentId(parentId: string): Promise<CoParentAssignment[]> {
    return this.prisma.coParentAssignment.findMany({
      where: { parentId, status: 'active' },
    });
  }

  // M16 (docs/sprints/sprint-03.md, §4; ADR-0015 §7.2) — the
  // family-delete cascade's "every CoParentAssignment for that Family
  // (revoked)" step needs every currently-active assignment for the
  // family, not one specific (family, parent) pair.
  findActiveByFamilyId(familyId: string): Promise<CoParentAssignment[]> {
    return this.prisma.coParentAssignment.findMany({
      where: { familyId, status: 'active' },
    });
  }

  findActiveByFamilyAndParentId(
    familyId: string,
    parentId: string,
  ): Promise<CoParentAssignment | null> {
    return this.prisma.coParentAssignment.findFirst({
      where: { familyId, parentId, status: 'active' },
    });
  }

  // ADR-0009, Decision item 6 — revoking an assignment is the trigger
  // for the session-revocation cascade (session-lifecycle.service.ts).
  // Setting status alone does not end sessions; the cascade is a
  // separate, explicit step the caller must also perform.
  revoke(id: string, revokedByParentId: string): Promise<CoParentAssignment> {
    return this.prisma.coParentAssignment.update({
      where: { id },
      data: { status: 'revoked', revokedAt: new Date(), revokedByParentId },
    });
  }
}
