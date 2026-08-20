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

  // M16 (docs/sprints/sprint-03.md, §4; ADR-0015 §7.2) — the
  // family-delete cascade's "every Child in that Family (soft-deleted)"
  // step needs the still-active children, not every child ever created.
  findActiveByFamilyId(familyId: string): Promise<Child[]> {
    return this.prisma.child.findMany({ where: { familyId, status: 'active' } });
  }

  // ADR-0015 §5 — soft-delete: status -> deleted, deletedAt recorded
  // (the timestamp §4 flagged as missing from M14's schema).
  softDelete(id: string): Promise<Child> {
    return this.prisma.child.update({
      where: { id },
      data: { status: 'deleted', deletedAt: new Date() },
    });
  }

  // ADR-0015 §6 — hard-delete via tombstone, not physical row removal:
  // Child has no other table's FK pointing at it yet in this schema,
  // but AuditEvent.childId does (a nullable, non-restricting FK) and
  // Tier 3/4 content will (M18+) — tombstoning now avoids revisiting
  // this choice once those references exist. Content/PII fields are
  // scrubbed with a fixed erasure marker; dateOfBirth is NOT NULL in
  // the M14 schema, so it is set to a fixed sentinel date rather than
  // left holding the real value — this is a real, minimal PII fact
  // about the child, not exempt from §6's "every content/PII field is
  // scrubbed."
  tombstone(id: string): Promise<Child> {
    return this.prisma.child.update({
      where: { id },
      data: {
        firstName: '[deleted]',
        dateOfBirth: new Date('1970-01-01'),
        avatarRef: null,
        hardDeletedAt: new Date(),
      },
    });
  }

  // Scan for soft-deleted rows whose hard-delete window (ADR-0015
  // §13.1) has elapsed and which have not already been tombstoned —
  // consumed by lifecycle.service.ts's hard-delete sweep.
  findEligibleForHardDelete(cutoff: Date): Promise<Child[]> {
    return this.prisma.child.findMany({
      where: { deletedAt: { not: null, lte: cutoff }, hardDeletedAt: null },
    });
  }
}
