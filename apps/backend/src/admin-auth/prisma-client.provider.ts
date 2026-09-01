import { Provider } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// M25 (docs/sprints/sprint-05.md, §4). Same self-contained,
// module-local pattern as audit/prisma-client.provider.ts and
// identity-family/prisma-client.provider.ts — the admin/migration-role
// client (DATABASE_URL), never the RLS-subject natkhat_app_role:
// admin_user carries no family_id, so it is not a Row-Level-Security
// concern (see the migration's own comment).
export const ADMIN_AUTH_PRISMA_CLIENT = Symbol('ADMIN_AUTH_PRISMA_CLIENT');

export const adminAuthPrismaClientProvider: Provider = {
  provide: ADMIN_AUTH_PRISMA_CLIENT,
  useFactory: () => new PrismaClient(),
};
