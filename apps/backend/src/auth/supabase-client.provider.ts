import { SupabaseClient, createClient } from '@supabase/supabase-js';

// M15 (docs/sprints/sprint-03.md, §4; ADR-0005; Decision J.5). Points
// at a real, non-production DEV Supabase project — test accounts
// only, no India-residency claim, no production credentials. Never a
// hardcoded value; both env vars are required at first use.
//
// A plain lazy function, deliberately NOT registered as a NestJS DI
// provider. NestJS eagerly instantiates every provider in a module
// that is imported into the running application graph — registering
// this as a provider would mean any future `Test.createTestingModule
// ({ imports: [AppModule] })` or app bootstrap throws immediately if
// SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are unset, even for code
// paths that never touch auth. Same precedent as
// identity-family/rls-context.ts's getAppPrismaClient(): the missing-
// env-var error surfaces the first time the client is actually used
// (inside SupabaseAuthService's methods), not at module load. No dev
// Supabase project exists yet for most contributors' environments,
// and unrelated backend commands (build, typecheck, lint, other
// modules' tests) must keep working without one.
let cachedClient: SupabaseClient | undefined;

export function getSupabaseClient(): SupabaseClient {
  if (!cachedClient) {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set — required to verify Supabase-issued ' +
          'access tokens against the M15 non-production dev project (Decision J.5). See ' +
          'apps/backend/.env.example. Never a production project or credential.',
      );
    }
    // Service-role key is used server-side only, to call
    // auth.getUser(jwt) for token verification — never exposed to a
    // client. No row-level Supabase client usage exists in this
    // milestone (M14's Postgres RLS remains the isolation layer for
    // Natkhat's own tables; Supabase Auth's own user table is not
    // subject to it).
    cachedClient = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return cachedClient;
}

export function resetSupabaseClientForTests(): void {
  cachedClient = undefined;
}
