import { Provider } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// M16 (docs/sprints/sprint-03.md, §4). Same self-contained pattern as
// identity-family/prisma-client.provider.ts — a module-local admin/
// migration-role client (DATABASE_URL), not shared cross-module via a
// common token, matching that file's own precedent rather than
// introducing a new shared-provider concept for two modules.
export const AUDIT_PRISMA_CLIENT = Symbol('AUDIT_PRISMA_CLIENT');

export const auditPrismaClientProvider: Provider = {
  provide: AUDIT_PRISMA_CLIENT,
  useFactory: () => new PrismaClient(),
};
