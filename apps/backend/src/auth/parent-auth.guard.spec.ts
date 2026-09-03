import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ParentAuthGuard } from './parent-auth.guard';

// M27 — unit test for the guard's request-shape handling (missing/
// malformed Authorization header, token rejected by the service),
// isolated from FirebaseAuthService's own token-verification logic
// (covered separately by firebase-auth.service.spec.ts /
// firebase-auth.integration.spec.ts). Mirrors
// admin-auth/admin-auth.guard.spec.ts exactly — same guard shape, same
// test structure.
describe('ParentAuthGuard', () => {
  function buildContext(headers: Record<string, string | undefined>): {
    context: ExecutionContext;
    request: { headers: Record<string, string | undefined>; parent?: unknown };
  } {
    const request: { headers: Record<string, string | undefined>; parent?: unknown } = {
      headers,
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
    return { context, request };
  }

  it('rejects a request with no Authorization header', async () => {
    const firebaseAuthService = { resolveParentFromIdToken: jest.fn() };
    const guard = new ParentAuthGuard(firebaseAuthService as never);
    const { context } = buildContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(firebaseAuthService.resolveParentFromIdToken).not.toHaveBeenCalled();
  });

  it('rejects a non-Bearer Authorization header', async () => {
    const firebaseAuthService = { resolveParentFromIdToken: jest.fn() };
    const guard = new ParentAuthGuard(firebaseAuthService as never);
    const { context } = buildContext({ authorization: 'Basic abc123' });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(firebaseAuthService.resolveParentFromIdToken).not.toHaveBeenCalled();
  });

  it('rejects when FirebaseAuthService cannot resolve the token to a Parent', async () => {
    const firebaseAuthService = {
      resolveParentFromIdToken: jest.fn().mockRejectedValue(new Error('not a parent')),
    };
    const guard = new ParentAuthGuard(firebaseAuthService as never);
    const { context } = buildContext({ authorization: 'Bearer some-token' });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('allows the request through and attaches parent when resolution succeeds', async () => {
    const parent = { id: 'parent-1', authIdentityRef: 'firebase-parent-1' };
    const firebaseAuthService = {
      resolveParentFromIdToken: jest.fn().mockResolvedValue(parent),
    };
    const guard = new ParentAuthGuard(firebaseAuthService as never);
    const { context, request } = buildContext({ authorization: 'Bearer a-real-token' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(firebaseAuthService.resolveParentFromIdToken).toHaveBeenCalledWith('a-real-token');
    expect(request.parent).toEqual(parent);
  });
});
