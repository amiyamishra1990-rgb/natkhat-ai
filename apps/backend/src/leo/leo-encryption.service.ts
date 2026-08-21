import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { LEO_CONFIG } from './leo.config.provider';
import type { LeoConfig } from './leo.config';
import { FamilyEncryptionKeyRepository } from './repositories/family-encryption-key.repository';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12;
const AUTH_TAG_LENGTH_BYTES = 16;
const DEK_LENGTH_BYTES = 32;

export class LeoKekNotConfiguredError extends Error {
  constructor() {
    super(
      'LEO_MEMORY_KEK is not set — refusing to read or write Tier-3 content rather than fall back to plaintext (see leo.config.ts; this is a dev-only stopgap standing in for a not-yet-selected production KMS).',
    );
    this.name = 'LeoKekNotConfiguredError';
  }
}

export class LeoDekNotFoundError extends Error {
  constructor(familyId: string) {
    super(`No FamilyEncryptionKey exists for family ${familyId} — cannot decrypt.`);
    this.name = 'LeoDekNotFoundError';
  }
}

/**
 * M18 — the dev-only crypto stopgap standing in for
 * data-classification-and-isolation.md §5.2's per-Family envelope-
 * encryption design (see leo.config.ts's header for the full
 * production-KMS disclaimer; do not treat this class as a KMS
 * integration). AES-256-GCM throughout: LEO_MEMORY_KEK wraps each
 * Family's randomly-generated 32-byte DEK (`wrapDek`/`unwrapDek`); the
 * unwrapped DEK then encrypts/decrypts Tier-3 content fields
 * (`encryptContent`/`decryptContent`). Every "blob" produced or
 * consumed here is `iv (12 bytes) || authTag (16 bytes) || ciphertext`
 * concatenated into one Buffer — never a bare ciphertext, so the GCM
 * auth tag travels with its own ciphertext rather than being stored
 * separately.
 *
 * Fails closed: every public method throws LeoKekNotConfiguredError
 * immediately if LEO_MEMORY_KEK is unset, before touching the
 * database or producing any output — there is no silent
 * plaintext-fallback path.
 */
@Injectable()
export class LeoEncryptionService {
  constructor(
    @Inject(LEO_CONFIG) private readonly config: LeoConfig,
    private readonly familyEncryptionKeyRepository: FamilyEncryptionKeyRepository,
  ) {}

  private requireKek(): Buffer {
    if (!this.config.memoryKek) {
      throw new LeoKekNotConfiguredError();
    }
    return this.config.memoryKek;
  }

  // `key`/`plaintext`/`blob` are typed as plain Uint8Array, not
  // Buffer, deliberately: Prisma's generated client types its Bytes
  // columns (FamilyEncryptionKey.wrappedDek, Message.content,
  // LeoMemory.content) as Uint8Array<ArrayBuffer>, and — because
  // @types/node's own Buffer interface widens its default backing-
  // store generic to ArrayBufferLike — a bare `Buffer`-typed parameter
  // does not structurally accept those values even though every real
  // Buffer instance is a Uint8Array at runtime. No return-type
  // annotation is given here deliberately either: leaving it inferred
  // preserves Buffer.concat's own precise `Buffer<ArrayBuffer>` return
  // type (see buffer.buffer.d.ts's declaration), which — unlike a
  // hand-written `: Buffer` annotation — is narrow enough to satisfy
  // repository create() calls' Uint8Array<ArrayBuffer> parameters with
  // no cast.
  private seal(key: Uint8Array, plaintext: Uint8Array) {
    const iv = randomBytes(IV_LENGTH_BYTES);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, ciphertext]);
  }

  private open(key: Uint8Array, blob: Uint8Array) {
    const iv = blob.subarray(0, IV_LENGTH_BYTES);
    const authTag = blob.subarray(IV_LENGTH_BYTES, IV_LENGTH_BYTES + AUTH_TAG_LENGTH_BYTES);
    const ciphertext = blob.subarray(IV_LENGTH_BYTES + AUTH_TAG_LENGTH_BYTES);
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  }

  /**
   * data-classification-and-isolation.md §5.2 — "each Family has
   * exactly one active DEK." Lazily provisions one on first use
   * (generated here, wrapped by the KEK, persisted), rather than
   * requiring a separate Family-provisioning step — no code path in
   * this milestone creates a Family without eventually needing a DEK
   * for its first piece of Tier-3 content.
   */
  private async getOrCreateFamilyDek(familyId: string) {
    const kek = this.requireKek();
    const existing = await this.familyEncryptionKeyRepository.findByFamilyId(familyId);
    if (existing) {
      return this.open(kek, existing.wrappedDek);
    }
    const dek = randomBytes(DEK_LENGTH_BYTES);
    const wrappedDek = this.seal(kek, dek);
    await this.familyEncryptionKeyRepository.create({ familyId, wrappedDek });
    return dek;
  }

  private async getExistingFamilyDek(familyId: string) {
    const kek = this.requireKek();
    const existing = await this.familyEncryptionKeyRepository.findByFamilyId(familyId);
    if (!existing) {
      throw new LeoDekNotFoundError(familyId);
    }
    return this.open(kek, existing.wrappedDek);
  }

  async encryptContent(familyId: string, plaintext: string) {
    const dek = await this.getOrCreateFamilyDek(familyId);
    return this.seal(dek, Buffer.from(plaintext, 'utf8'));
  }

  async decryptContent(familyId: string, blob: Uint8Array): Promise<string> {
    const dek = await this.getExistingFamilyDek(familyId);
    return this.open(dek, blob).toString('utf8');
  }
}
