import {
  FirebaseAuthService,
  InvalidAccessTokenError,
  UnknownParentIdentityError,
} from './firebase-auth.service';
import * as firebaseAdminProvider from './firebase-admin.provider';

jest.mock('./firebase-admin.provider');

// M15 — Unit test with a mocked Firebase Admin Auth instance, per §10's
// minimum bar for the pieces that do not require a live external
// dependency. This does NOT satisfy sprint-03.md §4 M15's "Integration
// ... executable against real auth" requirement on its own — that
// requires a real, non-production dev Firebase project (ADR-0016),
// which does not exist in every contributor's environment. See
// firebase-auth.integration.spec.ts (skipped until
// FIREBASE_PROJECT_ID/FIREBASE_WEB_API_KEY are supplied and ADC is
// configured locally).
describe('FirebaseAuthService', () => {
  const verifyIdToken = jest.fn();

  beforeEach(() => {
    verifyIdToken.mockReset();
    (firebaseAdminProvider.getFirebaseAuth as jest.Mock).mockReturnValue({
      verifyIdToken,
    });
  });

  function buildService(parents: Array<{ authIdentityRef: string; id: string }>) {
    const parentRepository = {
      findByAuthIdentityRef: jest.fn((ref: string) =>
        Promise.resolve(parents.find((p) => p.authIdentityRef === ref) ?? null),
      ),
    };
    return new FirebaseAuthService(parentRepository as never);
  }

  it('resolves the Parent matching the verified Firebase user id', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'firebase-user-1' });
    const service = buildService([{ authIdentityRef: 'firebase-user-1', id: 'parent-1' }]);

    const parent = await service.resolveParentFromIdToken('a-token');

    expect(parent).toEqual({ authIdentityRef: 'firebase-user-1', id: 'parent-1' });
    expect(verifyIdToken).toHaveBeenCalledWith('a-token');
  });

  it('throws InvalidAccessTokenError when Firebase rejects the token', async () => {
    verifyIdToken.mockRejectedValue(new Error('invalid'));
    const service = buildService([]);

    await expect(service.resolveParentFromIdToken('bad-token')).rejects.toThrow(
      InvalidAccessTokenError,
    );
  });

  it('throws UnknownParentIdentityError when no Parent matches the verified identity', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'firebase-user-orphan' });
    const service = buildService([{ authIdentityRef: 'someone-else', id: 'parent-1' }]);

    await expect(service.resolveParentFromIdToken('a-token')).rejects.toThrow(
      UnknownParentIdentityError,
    );
  });
});
