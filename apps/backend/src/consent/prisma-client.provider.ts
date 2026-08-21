import { Provider } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// M17 (docs/sprints/sprint-03.md, §4). Self-contained, like
// audit/prisma-client.provider.ts — a module-local admin/migration-
// role client (DATABASE_URL). Deliberately its own instance, not
// shared cross-module via a common token: the atomic Child+ConsentEvent
// co-creation path (consent.service.ts) needs its own
// `$transaction(...)` call spanning the `child` and `consent_event`
// tables, which any PrismaClient instance connected to this same
// physical database can do — it does not need to be
// identity-family's specific instance for atomicity to hold.
export const CONSENT_PRISMA_CLIENT = Symbol('CONSENT_PRISMA_CLIENT');

export const consentPrismaClientProvider: Provider = {
  provide: CONSENT_PRISMA_CLIENT,
  useFactory: () => new PrismaClient(),
};
