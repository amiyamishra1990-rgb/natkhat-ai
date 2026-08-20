import { Inject, Injectable } from '@nestjs/common';
import { Parent } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma-client.provider';
import type { PrismaClientLike } from './types';

// module doc §3.2. No API surface (M14 exclusion) — repository-layer
// only, consumed by tests directly and by future NestJS providers.
@Injectable()
export class ParentRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClientLike) {}

  create(data: {
    id?: string;
    authIdentityRef: string;
    displayName: string;
    contactEmail: string;
  }): Promise<Parent> {
    return this.prisma.parent.create({ data });
  }

  findById(id: string): Promise<Parent | null> {
    return this.prisma.parent.findUnique({ where: { id } });
  }

  // M15 (docs/sprints/sprint-03.md, §4) — resolves the Parent record
  // matching the identity Supabase Auth issued, per M1 §3.2's
  // `authIdentityRef` placeholder link (ADR-0009 §8: "already the
  // placeholder link for that"). Used by auth/supabase-auth.service.ts
  // after a Supabase-issued token is verified; never used to bypass
  // verification, only to look up the already-verified identity.
  findByAuthIdentityRef(authIdentityRef: string): Promise<Parent | null> {
    return this.prisma.parent.findUnique({ where: { authIdentityRef } });
  }

  // M16 (docs/sprints/sprint-03.md, §4; ADR-0015 §5–§6/§7.3) — same
  // soft-delete/tombstone mechanism as child.repository.ts.
  softDelete(id: string): Promise<Parent> {
    return this.prisma.parent.update({
      where: { id },
      data: { status: 'deleted', deletedAt: new Date() },
    });
  }

  // authIdentityRef is scrubbed to a per-row, still-unique tombstone
  // marker (not a shared fixed string) because the column carries a
  // UNIQUE constraint (M15) — a literal shared marker across every
  // tombstoned Parent would violate it. This still satisfies §6's
  // "fixed erasure marker" intent: the value is deterministic,
  // content-free, and never resolves back to the real external
  // identity Supabase Auth issued.
  tombstone(id: string): Promise<Parent> {
    return this.prisma.parent.update({
      where: { id },
      data: {
        displayName: '[deleted]',
        contactEmail: 'deleted@tombstoned.invalid',
        authIdentityRef: `tombstoned:${id}`,
        hardDeletedAt: new Date(),
      },
    });
  }

  findEligibleForHardDelete(cutoff: Date): Promise<Parent[]> {
    return this.prisma.parent.findMany({
      where: { deletedAt: { not: null, lte: cutoff }, hardDeletedAt: null },
    });
  }
}
