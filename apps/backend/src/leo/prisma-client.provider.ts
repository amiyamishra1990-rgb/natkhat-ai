import { Provider } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// M18 (docs/sprints/sprint-03.md, §4). Same self-contained pattern as
// audit/prisma-client.provider.ts and consent/prisma-client.provider.ts
// — a module-local admin/migration-role client (DATABASE_URL), not
// shared cross-module via a common token. This is also the only
// client that ever reads/writes family_encryption_key (see that
// table's migration comment) — deliberately never the RLS-bounded
// natkhat_app_role connection.
export const LEO_PRISMA_CLIENT = Symbol('LEO_PRISMA_CLIENT');

export const leoPrismaClientProvider: Provider = {
  provide: LEO_PRISMA_CLIENT,
  useFactory: () => new PrismaClient(),
};
