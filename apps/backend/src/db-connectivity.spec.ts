import { PrismaClient } from '@prisma/client';

// M13 — proves Prisma can reach the local PostgreSQL instance
// (Decision J.5). No NestJS module or HTTP surface: connectivity only,
// per this milestone's explicit scope boundary.
describe('local PostgreSQL connectivity (M13)', () => {
  const prisma = new PrismaClient();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('connects to DATABASE_URL and executes a trivial query', async () => {
    await expect(prisma.$queryRaw`SELECT 1`).resolves.toBeDefined();
  });
});
