import { Inject, Injectable } from '@nestjs/common';
import { Conversation } from '@prisma/client';
import { LEO_PRISMA_CLIENT } from '../prisma-client.provider';
import type { PrismaClientLike } from './types';

// M18 (docs/sprints/sprint-03.md, §4; ADR-0012 item 1;
// ai-memory-isolation.md §3.1). Repository-layer only, no API surface
// — same convention every M14-M17 repository follows.
//
// Every scoped lookup below filters by BOTH familyId and childId in
// the query's own WHERE clause, never only by id with a post-fetch
// check — this is §7.4's "structurally unable to read... even though
// both children's rows pass the same family_id RLS predicate"
// requirement, implemented at the repository layer so leo.service.ts
// cannot accidentally bypass it by calling a narrower method.
@Injectable()
export class ConversationRepository {
  constructor(@Inject(LEO_PRISMA_CLIENT) private readonly prisma: PrismaClientLike) {}

  create(data: { id?: string; familyId: string; childId: string }): Promise<Conversation> {
    return this.prisma.conversation.create({ data });
  }

  findByIdScoped(params: {
    id: string;
    familyId: string;
    childId: string;
  }): Promise<Conversation | null> {
    return this.prisma.conversation.findFirst({
      where: { id: params.id, familyId: params.familyId, childId: params.childId },
    });
  }

  async touchLastMessageAt(params: {
    id: string;
    familyId: string;
    childId: string;
    at: Date;
  }): Promise<void> {
    await this.prisma.conversation.updateMany({
      where: { id: params.id, familyId: params.familyId, childId: params.childId },
      data: { lastMessageAt: params.at },
    });
  }

  // ai-memory-isolation.md §5.3 — Child/Family-deletion cascade steps,
  // consumed by lifecycle.service.ts. Scoped to still-active rows,
  // same "don't re-soft-delete an already-deleted row" convention
  // child.repository.ts's findActiveByFamilyId already established.
  async softDeleteActiveByChildId(childId: string, at: Date): Promise<number> {
    const result = await this.prisma.conversation.updateMany({
      where: { childId, status: 'active' },
      data: { status: 'deleted', deletedAt: at },
    });
    return result.count;
  }

  async softDeleteActiveByFamilyId(familyId: string, at: Date): Promise<number> {
    const result = await this.prisma.conversation.updateMany({
      where: { familyId, status: 'active' },
      data: { status: 'deleted', deletedAt: at },
    });
    return result.count;
  }

  // §5.2/M16's already-approved 90-day window. Conversation has no
  // content/PII field of its own to scrub (unlike Message/LeoMemory) —
  // tombstoning it only records hardDeletedAt, matching child.
  // repository.ts's "every content/PII field is scrubbed" rule
  // vacuously (there is none here to scrub).
  tombstone(id: string): Promise<Conversation> {
    return this.prisma.conversation.update({
      where: { id },
      data: { hardDeletedAt: new Date() },
    });
  }

  findEligibleForHardDelete(cutoff: Date): Promise<Conversation[]> {
    return this.prisma.conversation.findMany({
      where: { deletedAt: { not: null, lte: cutoff }, hardDeletedAt: null },
    });
  }
}
