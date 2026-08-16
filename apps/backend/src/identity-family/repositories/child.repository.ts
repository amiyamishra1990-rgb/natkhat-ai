import { Inject, Injectable } from '@nestjs/common';
import { Child } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma-client.provider';
import type { PrismaClientLike } from './types';

// module doc §3.4. No API surface (M14 exclusion) — repository-layer
// only, consumed by tests directly and by future NestJS providers.
// Every field required by Prisma's generated types below (familyId in
// particular) is enforced at the database layer by the M14 migration's
// NOT NULL columns — a Child cannot be created without a family_id.
@Injectable()
export class ChildRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClientLike) {}

  create(data: {
    id?: string;
    familyId: string;
    firstName: string;
    dateOfBirth: Date;
    avatarRef?: string;
    createdByParentId: string;
  }): Promise<Child> {
    return this.prisma.child.create({ data });
  }

  findById(id: string): Promise<Child | null> {
    return this.prisma.child.findUnique({ where: { id } });
  }

  findMany(): Promise<Child[]> {
    return this.prisma.child.findMany();
  }
}
