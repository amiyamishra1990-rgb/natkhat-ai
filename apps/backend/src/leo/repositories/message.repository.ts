import { Inject, Injectable } from '@nestjs/common';
import { Message, MessageSender } from '@prisma/client';
import { LEO_PRISMA_CLIENT } from '../prisma-client.provider';
import type { PrismaClientLike } from './types';

// M18 (docs/sprints/sprint-03.md, §4; ADR-0012 item 1;
// ai-memory-isolation.md §3.2, §5.1). `content` is always the
// already-encrypted ciphertext blob (leo-encryption.service.ts) —
// this repository never sees plaintext. Every scoped query filters by
// familyId AND childId directly, same §7.4 rationale as
// conversation.repository.ts's header comment.
@Injectable()
export class MessageRepository {
  constructor(@Inject(LEO_PRISMA_CLIENT) private readonly prisma: PrismaClientLike) {}

  create(data: {
    id?: string;
    conversationId: string;
    familyId: string;
    childId: string;
    sender: MessageSender;
    // See family-encryption-key.repository.ts's create() comment for
    // why this is Uint8Array<ArrayBuffer>, not bare Uint8Array/Buffer.
    content: Uint8Array<ArrayBuffer>;
  }): Promise<Message> {
    return this.prisma.message.create({ data });
  }

  // §5.1 — Message is immutable once written; this is a read path
  // only, never used to build an update.
  findByConversationScoped(params: {
    conversationId: string;
    familyId: string;
    childId: string;
  }): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: {
        conversationId: params.conversationId,
        familyId: params.familyId,
        childId: params.childId,
        status: 'active',
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async softDeleteActiveByChildId(childId: string, at: Date): Promise<number> {
    const result = await this.prisma.message.updateMany({
      where: { childId, status: 'active' },
      data: { status: 'deleted', deletedAt: at },
    });
    return result.count;
  }

  async softDeleteActiveByFamilyId(familyId: string, at: Date): Promise<number> {
    const result = await this.prisma.message.updateMany({
      where: { familyId, status: 'active' },
      data: { status: 'deleted', deletedAt: at },
    });
    return result.count;
  }

  // §6/M16's 90-day window. `content` is the one real PII/content
  // field here (§7.1) — scrubbed to an empty buffer, same
  // fixed-erasure-marker spirit as child.repository.ts's tombstone.
  tombstone(id: string): Promise<Message> {
    return this.prisma.message.update({
      where: { id },
      data: { content: Buffer.alloc(0), hardDeletedAt: new Date() },
    });
  }

  findEligibleForHardDelete(cutoff: Date): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { deletedAt: { not: null, lte: cutoff }, hardDeletedAt: null },
    });
  }
}
