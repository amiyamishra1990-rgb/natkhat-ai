import { Inject, Injectable } from '@nestjs/common';
import { Family } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma-client.provider';
import type { PrismaClientLike } from './types';

// module doc §3.3. No API surface (M14 exclusion) — repository-layer
// only, consumed by tests directly and by future NestJS providers.
@Injectable()
export class FamilyRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClientLike) {}

  create(data: { id?: string; owningParentId: string; displayName: string }): Promise<Family> {
    return this.prisma.family.create({ data });
  }

  findById(id: string): Promise<Family | null> {
    return this.prisma.family.findUnique({ where: { id } });
  }

  findMany(): Promise<Family[]> {
    return this.prisma.family.findMany();
  }

  // M15 (docs/sprints/sprint-03.md, §4; ADR-0009 §4 step 1) — resolves
  // the "owner" half of a Parent's authorized-family set. A Parent is
  // not restricted to owning a single Family by anything in the M14
  // schema, so this returns every Family they own, not just one.
  findByOwningParentId(owningParentId: string): Promise<Family[]> {
    return this.prisma.family.findMany({ where: { owningParentId } });
  }

  // M16 (docs/sprints/sprint-03.md, §4; ADR-0015 §5–§6) — same
  // soft-delete/tombstone mechanism as child.repository.ts; see that
  // file's comments for the shared rationale.
  softDelete(id: string): Promise<Family> {
    return this.prisma.family.update({
      where: { id },
      data: { status: 'deleted', deletedAt: new Date() },
    });
  }

  // displayName is the only content/PII field on Family (module doc
  // §3.3) — owningParentId is retained, not scrubbed, since it is a
  // structural reference other rows (Child.familyId,
  // CoParentAssignment.familyId) still resolve through, and is itself
  // scrubbed at its own Parent row's tombstone, not duplicated here.
  tombstone(id: string): Promise<Family> {
    return this.prisma.family.update({
      where: { id },
      data: { displayName: '[deleted]', hardDeletedAt: new Date() },
    });
  }

  findEligibleForHardDelete(cutoff: Date): Promise<Family[]> {
    return this.prisma.family.findMany({
      where: { deletedAt: { not: null, lte: cutoff }, hardDeletedAt: null },
    });
  }
}
