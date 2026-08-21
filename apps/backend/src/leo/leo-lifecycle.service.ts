import { Inject, Injectable } from '@nestjs/common';
import { LEO_CONFIG } from './leo.config.provider';
import type { LeoConfig } from './leo.config';
import { ConversationRepository } from './repositories/conversation.repository';
import { MessageRepository } from './repositories/message.repository';
import { LeoMemoryRepository } from './repositories/leo-memory.repository';
import { FamilyEncryptionKeyRepository } from './repositories/family-encryption-key.repository';

/**
 * M18 — the deletion-cascade half of ai-memory-isolation.md §5.3
 * (extends, does not replace, lifecycle.service.ts's M16 Child/Family/
 * account cascades — consumed from there, not called directly by
 * anything else) and §5.4's class-specific retention rules. A
 * separate service from LeoService itself: this one is invoked by
 * lifecycle.service.ts's cascade/sweep methods, never by an
 * end-user-facing conversation/memory action, mirroring how M16 keeps
 * AuditService and LifecycleService as distinct collaborators rather
 * than one combined class.
 */
@Injectable()
export class LeoLifecycleService {
  constructor(
    @Inject(LEO_CONFIG) private readonly config: LeoConfig,
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly leoMemoryRepository: LeoMemoryRepository,
    private readonly familyEncryptionKeyRepository: FamilyEncryptionKeyRepository,
  ) {}

  /** §5.3 — Child-deletion cascade step: every Conversation/Message/LeoMemory for that Child. */
  async cascadeSoftDeleteForChild(
    childId: string,
  ): Promise<{ conversations: number; messages: number; memories: number }> {
    const at = new Date();
    const [conversations, messages, memories] = await Promise.all([
      this.conversationRepository.softDeleteActiveByChildId(childId, at),
      this.messageRepository.softDeleteActiveByChildId(childId, at),
      this.leoMemoryRepository.softDeleteActiveByChildId(childId, at),
    ]);
    return { conversations, messages, memories };
  }

  /**
   * §5.3 — Family-deletion cascade step: every Conversation/Message/
   * LeoMemory with that family_id, across every Child, including
   * permanent_vault rows (§5.3's table: "Class 3's 'permanent'
   * retention is explicitly bounded by the owning Parent's own
   * deletion authority, not beyond it").
   */
  async cascadeSoftDeleteForFamily(
    familyId: string,
  ): Promise<{ conversations: number; messages: number; memories: number }> {
    const at = new Date();
    const [conversations, messages, memories] = await Promise.all([
      this.conversationRepository.softDeleteActiveByFamilyId(familyId, at),
      this.messageRepository.softDeleteActiveByFamilyId(familyId, at),
      this.leoMemoryRepository.softDeleteActiveByFamilyId(familyId, at),
    ]);
    return { conversations, messages, memories };
  }

  /**
   * §6/M16's already-approved 90-day soft-delete -> hard-delete
   * window, applied to all three entities — the generic sweep,
   * independent of §5.4's version_history-specific expiry below.
   */
  async runHardDeleteSweep(
    cutoff: Date,
  ): Promise<{
    tombstonedConversations: number;
    tombstonedMessages: number;
    tombstonedMemories: number;
  }> {
    const [eligibleConversations, eligibleMessages, eligibleMemories] = await Promise.all([
      this.conversationRepository.findEligibleForHardDelete(cutoff),
      this.messageRepository.findEligibleForHardDelete(cutoff),
      this.leoMemoryRepository.findEligibleForHardDelete(cutoff),
    ]);

    await Promise.all(
      eligibleConversations.map((c) => this.conversationRepository.tombstone(c.id)),
    );
    await Promise.all(eligibleMessages.map((m) => this.messageRepository.tombstone(m.id)));
    await Promise.all(eligibleMemories.map((m) => this.leoMemoryRepository.tombstone(m.id)));

    return {
      tombstonedConversations: eligibleConversations.length,
      tombstonedMessages: eligibleMessages.length,
      tombstonedMemories: eligibleMemories.length,
    };
  }

  /**
   * §5.4 — version_history rows age out from their own createdAt,
   * independently of the current active row and independently of
   * whether a parent ever soft-deleted anything. A distinct sweep from
   * runHardDeleteSweep above, on its own configurable window
   * (LEO_VERSION_HISTORY_RETENTION_DAYS, default 90 — leo.config.ts).
   */
  async runVersionHistoryExpirySweep(): Promise<{ expired: number }> {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - this.config.versionHistoryRetentionDays);

    const eligible = await this.leoMemoryRepository.findVersionHistoryEligibleForExpiry(cutoff);
    await Promise.all(eligible.map((memory) => this.leoMemoryRepository.tombstone(memory.id)));
    return { expired: eligible.length };
  }

  /**
   * §7.5 — crypto-shredding. Called once, at the point a Family
   * itself completes hard-delete (lifecycle.service.ts's
   * runHardDeleteSweep, in its per-family tombstone step) — not part
   * of this class's own runHardDeleteSweep above, since that method
   * operates on Conversation/Message/LeoMemory rows individually and
   * has no per-family boundary of its own to hook this into.
   */
  async destroyFamilyDek(familyId: string): Promise<boolean> {
    return this.familyEncryptionKeyRepository.deleteByFamilyId(familyId);
  }
}
