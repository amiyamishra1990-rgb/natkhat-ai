import {
  InvalidAccessTokenError,
  SupabaseAuthService,
  UnknownParentIdentityError,
} from './supabase-auth.service';
import * as supabaseClientProvider from './supabase-client.provider';

jest.mock('./supabase-client.provider');

// M15 — Unit test with a mocked Supabase client, per §10's minimum
// bar for the pieces that do not require a live external dependency.
// This does NOT satisfy sprint-03.md §4 M15's "Integration ...
// executable against real auth" requirement on its own — that
// requires a real, non-production dev Supabase project (Decision
// J.5), which does not exist yet in this environment. See
// supabase-auth.integration.spec.ts (skipped until
// SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are supplied).
describe('SupabaseAuthService', () => {
  const getUser = jest.fn();

  beforeEach(() => {
    getUser.mockReset();
    (supabaseClientProvider.getSupabaseClient as jest.Mock).mockReturnValue({
      auth: { getUser },
    });
  });

  function buildService(parents: Array<{ authIdentityRef: string; id: string }>) {
    const parentRepository = {
      findByAuthIdentityRef: jest.fn((ref: string) =>
        Promise.resolve(parents.find((p) => p.authIdentityRef === ref) ?? null),
      ),
    };
    return new SupabaseAuthService(parentRepository as never);
  }

  it('resolves the Parent matching the verified Supabase user id', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'supabase-user-1' } }, error: null });
    const service = buildService([{ authIdentityRef: 'supabase-user-1', id: 'parent-1' }]);

    const parent = await service.resolveParentFromAccessToken('a-token');

    expect(parent).toEqual({ authIdentityRef: 'supabase-user-1', id: 'parent-1' });
    expect(getUser).toHaveBeenCalledWith('a-token');
  });

  it('throws InvalidAccessTokenError when Supabase rejects the token', async () => {
    getUser.mockResolvedValue({ data: null, error: { message: 'invalid' } });
    const service = buildService([]);

    await expect(service.resolveParentFromAccessToken('bad-token')).rejects.toThrow(
      InvalidAccessTokenError,
    );
  });

  it('throws UnknownParentIdentityError when no Parent matches the verified identity', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'supabase-user-orphan' } }, error: null });
    const service = buildService([{ authIdentityRef: 'someone-else', id: 'parent-1' }]);

    await expect(service.resolveParentFromAccessToken('a-token')).rejects.toThrow(
      UnknownParentIdentityError,
    );
  });
});
