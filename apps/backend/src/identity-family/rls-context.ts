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
 * §7.3).
 *
 * Both claims are set unconditionally on every call, never
 * conditionally skipped. Reason (found via the CI live-Postgres
 * integration run, not asserted from memory): the underlying
 * PrismaClient here is a pooled/reused connection, and PostgreSQL's
 * `current_setting(name, true)` for a *custom* GUC (namespaced like
 * `app.current_family_id`) only returns NULL if that GUC name has
 * never been referenced at all in the current backend session. Once
 * any transaction on a given pooled connection has called
 * `set_config` for a claim, that claim's session-level placeholder
 * exists — and a later transaction on that *same* connection that
 * omits the claim does not see NULL, it sees the placeholder's reset
 * value, which for a custom GUC is the empty string, not "unset."
 * Relying on "just don't call set_config" to represent "omitted" is
 * therefore unsafe under connection pooling: it silently depends on
 * this being the connection's first-ever use of that claim. Setting
 * both claims explicitly every time (defaulting to '' when the
 * caller omits one) removes that dependency entirely — every
 * transaction's claim state is fully determined by this call, never
 * by another transaction's history on a reused connection.
 *
 * The RLS policies (migration.sql) compare these claims as text, not
 * by casting the claim to uuid, specifically so that '' (and any
 * other non-uuid value) can never throw — it just fails to match any
 * real row, per §8 Scenario 2's fail-closed requirement.
 */
export async function withRlsContext<T>(
  context: RlsPrincipalContext,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  const client = getAppPrismaClient();
  return client.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_principal_id', ${context.principalId ?? ''}, true)`;
    await tx.$executeRaw`SELECT set_config('app.current_family_id', ${context.familyId ?? ''}, true)`;
    return fn(tx);
  });
}

export async function disconnectAppPrismaClient(): Promise<void> {
  if (appPrismaClient) {
    await appPrismaClient.$disconnect();
    appPrismaClient = undefined;
  }
}
