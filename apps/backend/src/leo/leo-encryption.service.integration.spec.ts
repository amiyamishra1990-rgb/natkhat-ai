import { randomUUID, randomBytes } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { FamilyEncryptionKeyRepository } from './repositories/family-encryption-key.repository';
import { LeoEncryptionService, LeoKekNotConfiguredError } from './leo-encryption.service';

// M18 — Integration (docs/sprints/sprint-03.md, §4; ADR-0012;
// data-classification-and-isolation.md §5.2; ai-memory-isolation.md
// §7.1/§7.5). Same live-Postgres pattern as consent.service.
// integration.spec.ts: admin/migration client only, not testing RLS
// here (that is leo-tenant-isolation.integration.spec.ts's job).
// Exercises the dev-only crypto stopgap end to end against a real
// FamilyEncryptionKey row, not merely asserted in isolation — per
// this milestone's explicit instruction that the round-trip and
// fail-closed-without-KEK behavior must actually run, not just be
// claimed.
describe('LeoEncryptionService — M18', () => {
  const admin = new PrismaClient();
  const familyEncryptionKeyRepository = new FamilyEncryptionKeyRepository(admin);

  const owner = { id: randomUUID() };
  const family = { id: randomUUID() };
  const secondFamily = { id: randomUUID() };

  // A fictional, test-only 32-byte KEK — never a real key, never
  // committed anywhere outside this spec file's own process memory.
  const testKek = randomBytes(32).toString('base64');

  const configuredService = new LeoEncryptionService(
    { memoryKek: Buffer.from(testKek, 'base64'), versionHistoryRetentionDays: 90 },
    familyEncryptionKeyRepository,
  );
  const unconfiguredService = new LeoEncryptionService(
    { memoryKek: null, versionHistoryRetentionDays: 90 },
    familyEncryptionKeyRepository,
  );

  beforeAll(async () => {
    await admin.parent.create({
      data: {
        id: owner.id,
        authIdentityRef: `fictional-auth-ref-${owner.id}`,
        displayName: 'Fictional Owner',
        contactEmail: `owner-${owner.id}@example.invalid`,
      },
    });
    await admin.family.create({
      data: { id: family.id, owningParentId: owner.id, displayName: 'Fictional Family' },
    });
    await admin.family.create({
      data: {
        id: secondFamily.id,
        owningParentId: owner.id,
        displayName: 'Fictional Second Family',
      },
    });
  });

  afterAll(async () => {
    await admin.familyEncryptionKey.deleteMany({
      where: { familyId: { in: [family.id, secondFamily.id] } },
    });
    await admin.family.deleteMany({ where: { id: { in: [family.id, secondFamily.id] } } });
    await admin.parent.deleteMany({ where: { id: owner.id } });
    await admin.$disconnect();
  });

  it('fails closed — every method throws LeoKekNotConfiguredError when LEO_MEMORY_KEK is unset, without writing anything', async () => {
    await expect(
      unconfiguredService.encryptContent(family.id, 'a fictional memory'),
    ).rejects.toThrow(LeoKekNotConfiguredError);

    // No FamilyEncryptionKey row was created by the failed attempt —
    // proving this is a real fail-closed refusal, not a caught-and-
    // ignored error with a side effect already committed.
    const key = await familyEncryptionKeyRepository.findByFamilyId(family.id);
    expect(key).toBeNull();

    await expect(
      unconfiguredService.decryptContent(family.id, Buffer.from('irrelevant')),
    ).rejects.toThrow(LeoKekNotConfiguredError);
  });

  it('round-trips real ciphertext through a real FamilyEncryptionKey row: encrypt, persist, re-fetch, decrypt', async () => {
    const plaintext = 'Fictional Leo memory: enjoys drawing dinosaurs.';

    const encrypted = await configuredService.encryptContent(family.id, plaintext);
    expect(Buffer.isBuffer(encrypted)).toBe(true);
    expect(encrypted.toString('utf8')).not.toContain(plaintext);

    const persistedKey = await familyEncryptionKeyRepository.findByFamilyId(family.id);
    expect(persistedKey).not.toBeNull();
    expect(persistedKey?.wrappedDek.length).toBeGreaterThan(0);

    // A fresh service instance, sharing nothing but the DB — proves
    // decryption works off the persisted wrapped DEK, not an
    // in-memory cache on the encrypting instance.
    const freshService = new LeoEncryptionService(
      { memoryKek: Buffer.from(testKek, 'base64'), versionHistoryRetentionDays: 90 },
      familyEncryptionKeyRepository,
    );
    const decrypted = await freshService.decryptContent(family.id, encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('reuses the same DEK across multiple encrypt calls for one Family (exactly one active DEK per Family, §5.2)', async () => {
    await configuredService.encryptContent(secondFamily.id, 'first fictional memory');
    await configuredService.encryptContent(secondFamily.id, 'second fictional memory');

    const keys = await admin.familyEncryptionKey.findMany({
      where: { familyId: secondFamily.id },
    });
    expect(keys).toHaveLength(1);
  });

  it("two different Families get two different DEKs — a leaked/misused key for one Family cannot decrypt another's content", async () => {
    const plaintextA = 'Fictional memory belonging to the first family.';
    const encryptedA = await configuredService.encryptContent(family.id, plaintextA);

    // secondFamily's own DEK exists from the prior test; attempting to
    // decrypt familyA's ciphertext as if it belonged to secondFamily
    // must fail (GCM auth-tag mismatch under the wrong key), not
    // silently return wrong plaintext.
    await expect(configuredService.decryptContent(secondFamily.id, encryptedA)).rejects.toThrow();
  });
});
