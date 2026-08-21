import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { Conversation, LeoMemory, MessageSender, PrismaClient } from '@prisma/client';
import { LEO_PRISMA_CLIENT } from './prisma-client.provider';
import { LeoEncryptionService } from './leo-encryption.service';
import { ConversationRepository } from './repositories/conversation.repository';
import { MessageRepository } from './repositories/message.repository';
import { LeoMemoryRepository } from './repositories/leo-memory.repository';

export class LeoConversationNotFoundError extends Error {
  constructor() {
    super(
      'No Conversation exists for the given (familyId, childId, id) — scoped lookup found nothing.',
    );
    this.name = 'LeoConversationNotFoundError';
  }
}

export class LeoMemoryNotFoundError extends Error {
  constructor() {
    super(
      'No LeoMemory exists for the given (familyId, childId, id) — scoped lookup found nothing.',
    );
    this.name = 'LeoMemoryNotFoundError';
  }
}

export class LeoVaultOwnerOnlyError extends Error {
  constructor() {
    super(
      'Adding a memory to the Permanent Vault is owner-only, unconditional (ai-memory-isolation.md §6.3, founder decision 2026-08-08) — the acting parent does not own this Family.',
    );
    this.name = 'LeoVaultOwnerOnlyError';
  }
}

export interface DecryptedMessage {
  id: string;
  sender: MessageSender;
  content: string;
  createdAt: Date;
}

export interface DecryptedMemory {
  id: string;
  memoryClass: LeoMemory['memoryClass'];
  content: string;
  createdAt: Date;
  supersedesMemoryId: string | null;
  vaultedFromMemoryId: string | null;
  vaultedAt: Date | null;
  vaultedByParentId: string | null;
}

/**
 * M18 — Leo Foundation & Memory Isolation, Track A scaffold
 * (docs/sprints/sprint-03.md, §4; ADR-0012;
 * docs/architecture/ai-memory-isolation.md §3-§8). No AI/LLM
 * integration, no embedding pipeline, no vector DB, no real
 * conversation content anywhere in this module — every fixture in
 * this milestone's own tests is fictional, created via M17's
 * ConsentService.createChildWithFoundingConsent Track-A scaffold, same
 * as M16/M17's own fixture convention.
 *
 * §7.4's cross-child application-layer isolation is this class's
 * central discipline: every public method here takes both `familyId`
 * and `childId`, and every repository call it makes filters by both
 * directly in the query's own WHERE clause (see each repository's
 * header comment) — never "fetch by id, then check the result
 * matches." A Leo session scoped to one Child is structurally unable
 * to read or write another Child's rows in the same Family, even
 * though both pass the same family_id RLS predicate (§7.2-§7.3). §7.6
 * records this as a single-layer (application-only) boundary, unlike
 * family isolation's two independent layers — a recorded residual
 * risk, not something this milestone closes, since no child-scoped
 * session claim exists in the current M1/M2 session model.
 */
@Injectable()
export class LeoService {
  constructor(
    @Inject(LEO_PRISMA_CLIENT) private readonly prisma: PrismaClient,
    private readonly encryptionService: LeoEncryptionService,
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly leoMemoryRepository: LeoMemoryRepository,
  ) {}

  async startConversation(params: { familyId: string; childId: string }): Promise<Conversation> {
    return this.conversationRepository.create({
      id: randomUUID(),
      familyId: params.familyId,
      childId: params.childId,
    });
  }

  /**
   * §3.2/§7.4 — re-validates the target Conversation belongs to this
   * exact (familyId, childId) pair before ever encrypting or writing a
   * Message, rather than trusting the caller's conversationId alone.
   */
  async appendMessage(params: {
    conversationId: string;
    familyId: string;
    childId: string;
    sender: MessageSender;
    content: string;
  }): Promise<DecryptedMessage> {
    const conversation = await this.conversationRepository.findByIdScoped({
      id: params.conversationId,
      familyId: params.familyId,
      childId: params.childId,
    });
    if (!conversation) {
      throw new LeoConversationNotFoundError();
    }

    const encryptedContent = await this.encryptionService.encryptContent(
      params.familyId,
      params.content,
    );
    const message = await this.messageRepository.create({
      id: randomUUID(),
      conversationId: params.conversationId,
      familyId: params.familyId,
      childId: params.childId,
      sender: params.sender,
      content: encryptedContent,
    });
    await this.conversationRepository.touchLastMessageAt({
      id: params.conversationId,
      familyId: params.familyId,
      childId: params.childId,
      at: message.createdAt,
    });

    return {
      id: message.id,
      sender: message.sender,
      content: params.content,
      createdAt: message.createdAt,
    };
  }

  async listMessages(params: {
    conversationId: string;
    familyId: string;
    childId: string;
  }): Promise<DecryptedMessage[]> {
    const messages = await this.messageRepository.findByConversationScoped(params);
    return Promise.all(
      messages.map(async (message) => ({
        id: message.id,
        sender: message.sender,
        content: await this.encryptionService.decryptContent(params.familyId, message.content),
        createdAt: message.createdAt,
      })),
    );
  }

  /** §3.3/ADR-0012 item 2 — a new Class 1 (active_relationship) row. */
  async addMemory(params: {
    familyId: string;
    childId: string;
    content: string;
  }): Promise<DecryptedMemory> {
    const encryptedContent = await this.encryptionService.encryptContent(
      params.familyId,
      params.content,
    );
    const memory = await this.leoMemoryRepository.create({
      id: randomUUID(),
      familyId: params.familyId,
      childId: params.childId,
      memoryClass: 'active_relationship',
      content: encryptedContent,
    });
    return this.toDecryptedMemory(memory, params.content);
  }

  /**
   * §5.1/§3.3 — supersession, never an in-place content mutation: the
   * prior row's memoryClass is reassigned to version_history (its
   * content untouched) and a brand-new Class 1 row is created pointing
   * back at it via supersedesMemoryId. Both the prior row and the new
   * one are independently re-validated against (familyId, childId)
   * before anything is written.
   */
  async correctMemory(params: {
    memoryId: string;
    familyId: string;
    childId: string;
    newContent: string;
  }): Promise<DecryptedMemory> {
    const priorMemory = await this.leoMemoryRepository.findByIdScoped({
      id: params.memoryId,
      familyId: params.familyId,
      childId: params.childId,
    });
    if (!priorMemory) {
      throw new LeoMemoryNotFoundError();
    }

    const encryptedContent = await this.encryptionService.encryptContent(
      params.familyId,
      params.newContent,
    );
    const [, newMemory] = await Promise.all([
      this.leoMemoryRepository.reassignToVersionHistory(priorMemory.id),
      this.leoMemoryRepository.create({
        id: randomUUID(),
        familyId: params.familyId,
        childId: params.childId,
        memoryClass: 'active_relationship',
        content: encryptedContent,
        supersedesMemoryId: priorMemory.id,
      }),
    ]);

    return this.toDecryptedMemory(newMemory, params.newContent);
  }

  /**
   * §6.3/ADR-0012 item 8 — owner-only, unconditional. Resolves the
   * Family's owning_parent_id directly (this module's own admin
   * PrismaClient, the same self-contained-provider justification
   * consent.service.ts's createChildWithFoundingConsent already
   * documents — no dependency on IdentityFamilyModule's exported
   * FamilyRepository is introduced for this one read) rather than
   * trusting a caller-supplied role flag, since this is the one action
   * in this milestone's scope the governing documents require this
   * service to actually enforce, not merely record (contrast with
   * consent.service.ts's withdrawConsent, which documents that its
   * caller has already been authorized upstream).
   */
  async addToVault(params: {
    memoryId: string;
    familyId: string;
    childId: string;
    actingParentId: string;
  }): Promise<DecryptedMemory> {
    const family = await this.prisma.family.findUnique({ where: { id: params.familyId } });
    if (!family || family.owningParentId !== params.actingParentId) {
      throw new LeoVaultOwnerOnlyError();
    }

    const sourceMemory = await this.leoMemoryRepository.findByIdScoped({
      id: params.memoryId,
      familyId: params.familyId,
      childId: params.childId,
    });
    if (!sourceMemory) {
      throw new LeoMemoryNotFoundError();
    }

    const plaintext = await this.encryptionService.decryptContent(
      params.familyId,
      sourceMemory.content,
    );
    const encryptedContent = await this.encryptionService.encryptContent(
      params.familyId,
      plaintext,
    );
    const vaultedMemory = await this.leoMemoryRepository.create({
      id: randomUUID(),
      familyId: params.familyId,
      childId: params.childId,
      memoryClass: 'permanent_vault',
      content: encryptedContent,
      vaultedFromMemoryId: sourceMemory.id,
      vaultedAt: new Date(),
      vaultedByParentId: params.actingParentId,
    });

    return this.toDecryptedMemory(vaultedMemory, plaintext);
  }

  async listActiveMemories(params: {
    familyId: string;
    childId: string;
  }): Promise<DecryptedMemory[]> {
    const memories = await this.leoMemoryRepository.findActiveByChildScoped(params);
    return Promise.all(
      memories.map(async (memory) => {
        const plaintext = await this.encryptionService.decryptContent(
          params.familyId,
          memory.content,
        );
        return this.toDecryptedMemory(memory, plaintext);
      }),
    );
  }

  private toDecryptedMemory(memory: LeoMemory, plaintext: string): DecryptedMemory {
    return {
      id: memory.id,
      memoryClass: memory.memoryClass,
      content: plaintext,
      createdAt: memory.createdAt,
      supersedesMemoryId: memory.supersedesMemoryId,
      vaultedFromMemoryId: memory.vaultedFromMemoryId,
      vaultedAt: memory.vaultedAt,
      vaultedByParentId: memory.vaultedByParentId,
    };
  }
}
