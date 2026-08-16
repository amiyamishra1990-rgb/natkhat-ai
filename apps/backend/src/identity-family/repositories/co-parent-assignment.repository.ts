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
}
