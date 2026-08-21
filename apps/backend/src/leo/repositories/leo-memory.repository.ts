import { Inject, Injectable } from '@nestjs/common';
import { LeoMemory, LeoMemoryClass } from '@prisma/client';
import { LEO_PRISMA_CLIENT } from '../prisma-client.provider';
import type { PrismaClientLike } from './types';

// M18 (docs/sprints/sprint-03.md, §4; ADR-0012 items 2-3;
// ai-memory-isolation.md §3.3, §5.1, §5.4, §6.3). `content` is always
// the already-encrypted ciphertext blob — this repository never sees
// plaintext. Every scoped query filters by familyId AND childId
// directly, same §7.4 rationale as conversation.repository.ts's
// header comment. Never exposes a generic "update a memory's content"
// method — §5.1's supersession-not-mutation invariant is enforced by
// only offering `create` (new rows) and `reassignToVersionHistory`
// (the one specific, narrow field-level transition §5.1 itself
// describes), not an open-ended update.
@Injectable()
export class LeoMemoryRepository {
  constructor(@Inject(LEO_PRISMA_CLIENT) private readonly prisma: PrismaClientLike) {}

  create(data: {
    id?: string;
    familyId: string;
    childId: string;
    memoryClass: LeoMemoryClass;
    // See family-encryption-key.repository.ts's create() comment for
    // why this is Uint8Array<ArrayBuffer>, not bare Uint8Array/Buffer.
    content: Uint8Array<ArrayBuffer>;
    supersedesMemoryId?: string | null;
    vaultedFromMemoryId?: string | null;
    vaultedAt?: Date | null;
    vaultedByParentId?: string | null;
  }): Promise<LeoMemory> {
    return this.prisma.leoMemory.create({ data });
  }

  findByIdScoped(params: {
    id: string;
    familyId: string;
    childId: string;
  }): Promise<LeoMemory | null> {
    return this.prisma.leoMemory.findFirst({
      where: { id: params.id, familyId: params.familyId, childId: params.childId },
    });
  }

  // §5.1/§3.3 — the one in-place field mutation this design permits:
  // a corrected Class 1 row's *prior* row is reassigned from
  // active_relationship to version_history. Content is untouched.
  reassignToVersionHistory(id: string): Promise<LeoMemory> {
    return this.prisma.leoMemory.update({
      where: { id },
      data: { memoryClass: 'version_history' },
    });
  }

  findActiveByChildScoped(params: {
    familyId: string;
    childId: string;
    memoryClass?: LeoMemoryClass;
  }): Promise<LeoMemory[]> {
    return this.prisma.leoMemory.findMany({
      where: {
        familyId: params.familyId,
        childId: params.childId,
        status: 'active',
        ...(params.memoryClass ? { memoryClass: params.memoryClass } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async softDeleteActiveByChildId(childId: string, at: Date): Promise<number> {
    const result = await this.prisma.leoMemory.updateMany({
      where: { childId, status: 'active' },
      data: { status: 'deleted', deletedAt: at },
    });
    return result.count;
  }

  async softDeleteActiveByFamilyId(familyId: string, at: Date): Promise<number> {
    const result = await this.prisma.leoMemory.updateMany({
      where: { familyId, status: 'active' },
      data: { status: 'deleted', deletedAt: at },
    });
    return result.count;
  }

  // §6/M16's 90-day window, generic across all three classes —
  // including permanent_vault: §5.4/§7.5 are explicit that "permanent"
  // is bounded by the owning parent's own deletion authority, never
  // an exception to this cascade.
  tombstone(id: string): Promise<LeoMemory> {
    return this.prisma.leoMemory.update({
      where: { id },
      data: { content: Buffer.alloc(0), hardDeletedAt: new Date() },
    });
  }

  findEligibleForHardDelete(cutoff: Date): Promise<LeoMemory[]> {
    return this.prisma.leoMemory.findMany({
      where: { deletedAt: { not: null, lte: cutoff }, hardDeletedAt: null },
    });
  }

  // §5.4 — version_history's own independent aging: expires from its
  // own createdAt, regardless of whether the row was ever soft-deleted
  // by a parent action. Deliberately excludes rows already scrubbed
  // (hardDeletedAt not null) so a row already tombstoned via the
  // generic sweep above is not tombstoned a second time.
  findVersionHistoryEligibleForExpiry(cutoff: Date): Promise<LeoMemory[]> {
    return this.prisma.leoMemory.findMany({
      where: { memoryClass: 'version_history', createdAt: { lte: cutoff }, hardDeletedAt: null },
    });
  }
}
