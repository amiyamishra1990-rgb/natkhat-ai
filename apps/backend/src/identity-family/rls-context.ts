import { Prisma, PrismaClient } from '@prisma/client';

// M14 (docs/sprints/sprint-03.md, §4; ADR-0010 §7.3–§7.4). PostgreSQL
// superusers always bypass Row-Level Security regardless of FORCE ROW
// LEVEL SECURITY, so the admin/migration client (DATABASE_URL,
// `postgres`) cannot be used to prove RLS enforcement — a second
// client, connected as the non-superuser, non-BYPASSRLS
// `natkhat_app_role` the M14 migration creates (APP_DATABASE_URL),
// is required. This module exists solely to provide that client and
// the session-claim mechanism §7.3 describes ("a SET LOCAL issued by
// the application" — implemented here via the parameterized
// `set_config(..., true)`, equivalent to SET LOCAL but bindable,
// avoiding raw string interpolation of the claim values).

let appPrismaClient: PrismaClient | undefined;

function getAppPrismaClient(): PrismaClient {
  if (!appPrismaClient) {
    if (!process.env.APP_DATABASE_URL) {
      throw new Error(
        'APP_DATABASE_URL is not set — required to connect as the RLS-subject natkhat_app_role (ADR-0010 §7.4). See apps/backend/.env.example.',
      );
    }
    appPrismaClient = new PrismaClient({
      datasources: { db: { url: process.env.APP_DATABASE_URL } },
    });
  }
  return appPrismaClient;
}

export interface RlsPrincipalContext {
  /** app.current_principal_id — data-classification-and-isolation.md §7.2 ("current_principal"). */
  principalId?: string;
  /** app.current_family_id — data-classification-and-isolation.md §7.3 ("current_family_claim"). */
  familyId?: string;
}

/**
 * Runs `fn` against the natkhat_app_role connection, inside a
 * transaction, with the given claim(s) applied via set_config(...,
 * true) (SET LOCAL semantics — scoped to this transaction only, per
 * §7.3). Omitting a claim leaves it unset for this transaction, which
 * every M14 policy treats as a non-match (fail-closed, §8 Scenario 2).
 */
export async function withRlsContext<T>(
  context: RlsPrincipalContext,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  const client = getAppPrismaClient();
  return client.$transaction(async (tx) => {
    if (context.principalId !== undefined) {
      await tx.$executeRaw`SELECT set_config('app.current_principal_id', ${context.principalId}, true)`;
    }
    if (context.familyId !== undefined) {
      await tx.$executeRaw`SELECT set_config('app.current_family_id', ${context.familyId}, true)`;
    }
    return fn(tx);
  });
}

export async function disconnectAppPrismaClient(): Promise<void> {
  if (appPrismaClient) {
    await appPrismaClient.$disconnect();
    appPrismaClient = undefined;
  }
}
