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
}
