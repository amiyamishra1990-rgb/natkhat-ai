import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { ParentRepository } from '../identity-family/repositories/parent.repository';
import { SupabaseAuthService, InvalidAccessTokenError } from './supabase-auth.service';
import { getSupabaseClient, resetSupabaseClientForTests } from './supabase-client.provider';

// M15 — the "Integration ... executable against real auth" bar
// sprint-03.md §4's M15 entry sets, run against the real, non-
// production dev Supabase project (Decision J.5). Skipped, not
// failed, when SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are not
// present — that dev project does not exist yet in this repository's
// history (§30/§31 of the project handover: "CURRENT DEV SUPABASE:
// Expected to be introduced for M15"). Once the founder provisions it
// and supplies the two env vars (as a local .env and as CI secrets),
// this suite runs for real and is the actual proof this milestone's
// Definition of Done requires — the mocked
// supabase-auth.service.spec.ts unit test is not a substitute for it,
// per the M14 lesson that mock-only tests do not prove
// security-sensitive behavior.
const hasSupabaseCredentials = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const describeIfConfigured = hasSupabaseCredentials ? describe : describe.skip;

describeIfConfigured('SupabaseAuthService — real dev Supabase project (M15)', () => {
  const admin = new PrismaClient();
  const parentRepository = new ParentRepository(admin);
  const service = new SupabaseAuthService(parentRepository);

  // A synthetic test account created for this run only — never a real
  // parent. Uses the Admin API (service-role key) so this suite does
  // not depend on email delivery/confirmation flows.
  const testEmail = `m15-integration-${randomUUID()}@example.invalid`;
  const testPassword = randomUUID();
  let supabaseUserId: string;
  let parentId: string;

  beforeAll(async () => {
    resetSupabaseClientForTests();
    const client = getSupabaseClient();
    const { data, error } = await client.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });
    if (error || !data.user) {
      throw new Error(`Failed to create synthetic Supabase test account: ${error?.message}`);
    }
    supabaseUserId = data.user.id;

    const parent = await admin.parent.create({
      data: {
        authIdentityRef: supabaseUserId,
        displayName: 'Fictional M15 Integration Parent',
        contactEmail: testEmail,
      },
    });
    parentId = parent.id;
  });

  afterAll(async () => {
    const client = getSupabaseClient();
    if (supabaseUserId) {
      await client.auth.admin.deleteUser(supabaseUserId);
    }
    if (parentId) {
      await admin.parent.delete({ where: { id: parentId } });
    }
    await admin.$disconnect();
  });

  it('resolves the Parent for a real, verified Supabase access token', async () => {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    if (error || !data.session) {
      throw new Error(`Synthetic test-account sign-in failed: ${error?.message}`);
    }

    const parent = await service.resolveParentFromAccessToken(data.session.access_token);
    expect(parent.id).toBe(parentId);
    expect(parent.authIdentityRef).toBe(supabaseUserId);
  });

  it('rejects a garbage/forged access token', async () => {
    await expect(service.resolveParentFromAccessToken('not-a-real-token')).rejects.toThrow(
      InvalidAccessTokenError,
    );
  });
});
