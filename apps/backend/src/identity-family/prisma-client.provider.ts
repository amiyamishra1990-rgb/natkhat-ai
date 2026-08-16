import { Provider } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// M14 (docs/sprints/sprint-03.md, §4). Admin/migration-role client
// (DATABASE_URL) for repository-layer use. No HTTP surface consumes
// this yet (M14 explicit exclusion) — registered so the repositories
// below are DI-resolvable now and reusable by M15+ without rewiring.
// This client is never itself the connection RLS is proven against —
// see apps/backend/src/identity-family/rls-context.ts for the
// separate, non-superuser natkhat_app_role client tests use for that.
export const PRISMA_CLIENT = Symbol('PRISMA_CLIENT');

export const prismaClientProvider: Provider = {
  provide: PRISMA_CLIENT,
  useFactory: () => new PrismaClient(),
};
