import { PrismaClient } from '@prisma/client';
import { ChildRepository } from './child.repository';

// M14 — Unit: entity invariants (docs/sprints/sprint-03.md, §4,
// M14 Testing requirements). Prisma's generated client validates a
// `create()` call's shape against the schema before any network call
// is made, so this proves the NOT NULL / required-relation invariants
// the migration's DDL enforces (family_id, created_by_parent_id) —
// without needing a live database connection.
describe('ChildRepository entity invariants (M14)', () => {
  // Never connected — Prisma performs argument validation client-side
  // before attempting to reach the database.
  const prisma = new PrismaClient();
  const repository = new ChildRepository(prisma);

  it('rejects creating a Child without a family_id', async () => {
    await expect(
      repository.create({
        // family_id intentionally omitted — cast bypasses the
        // TypeScript-level guarantee to prove the runtime invariant.
        firstName: 'Fictional Child',
        dateOfBirth: new Date('2020-01-01'),
        createdByParentId: '00000000-0000-0000-0000-000000000001',
      } as never),
    ).rejects.toThrow();
  });

  it('rejects creating a Child without a created_by_parent_id', async () => {
    await expect(
      repository.create({
        familyId: '00000000-0000-0000-0000-000000000002',
        firstName: 'Fictional Child',
        dateOfBirth: new Date('2020-01-01'),
      } as never),
    ).rejects.toThrow();
  });

  it('rejects creating a Child without a first_name', async () => {
    await expect(
      repository.create({
        familyId: '00000000-0000-0000-0000-000000000002',
        dateOfBirth: new Date('2020-01-01'),
        createdByParentId: '00000000-0000-0000-0000-000000000001',
      } as never),
    ).rejects.toThrow();
  });
});
