import {
  AdminAuthService,
  InvalidAccessTokenError,
  UnknownAdminIdentityError,
} from './admin-auth.service';
import * as firebaseAdminProvider from '../auth/firebase-admin.provider';

jest.mock('../auth/firebase-admin.provider');

// M25 — Unit test with a mocked Firebase Admin Auth instance, mirroring
// auth/firebase-auth.service.spec.ts's own pattern and its own
// disclaimer: this does not satisfy this milestone's "prove the
// admin-principal type is distinct from a parent/child credential"
// requirement on its own — that needs a real, non-production dev
// Firebase project. See admin-auth.integration.spec.ts.
describe('AdminAuthService', () => {
  const verifyIdToken = jest.fn();

  beforeEach(() => {
    verifyIdToken.mockReset();
    (firebaseAdminProvider.getFirebaseAuth as jest.Mock).mockReturnValue({
      verifyIdToken,
    });
  });

  function buildService(admins: Array<{ authIdentityRef: string; id: string }>) {
    const adminUserRepository = {
      findByAuthIdentityRef: jest.fn((ref: string) =>
        Promise.resolve(admins.find((a) => a.authIdentityRef === ref) ?? null),
      ),
    };
    return new AdminAuthService(adminUserRepository as never);
  }

  it('resolves the AdminUser matching the verified Firebase user id', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'firebase-admin-1' });
    const service = buildService([{ authIdentityRef: 'firebase-admin-1', id: 'admin-1' }]);

    const admin = await service.resolveAdminFromIdToken('a-token');

    expect(admin).toEqual({ authIdentityRef: 'firebase-admin-1', id: 'admin-1' });
    expect(verifyIdToken).toHaveBeenCalledWith('a-token');
  });

  it('throws InvalidAccessTokenError when Firebase rejects the token', async () => {
    verifyIdToken.mockRejectedValue(new Error('invalid'));
    const service = buildService([]);

    await expect(service.resolveAdminFromIdToken('bad-token')).rejects.toThrow(
      InvalidAccessTokenError,
    );
  });

  it('throws UnknownAdminIdentityError when no AdminUser matches the verified identity — e.g. a real Parent presenting their own valid token', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'firebase-parent-not-admin' });
    const service = buildService([{ authIdentityRef: 'someone-else', id: 'admin-1' }]);

    await expect(service.resolveAdminFromIdToken('a-token')).rejects.toThrow(
      UnknownAdminIdentityError,
    );
  });
});
