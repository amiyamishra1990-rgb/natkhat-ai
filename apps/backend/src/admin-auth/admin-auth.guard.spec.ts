import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AdminAuthGuard } from './admin-auth.guard';

// M25 — Unit test for the guard's request-shape handling (missing/
// malformed Authorization header, token rejected by the service),
// isolated from AdminAuthService's own Firebase-verification logic
// (covered separately by admin-auth.service.spec.ts /
// admin-auth.integration.spec.ts).
describe('AdminAuthGuard', () => {
  function buildContext(headers: Record<string, string | undefined>): {
    context: ExecutionContext;
    request: { headers: Record<string, string | undefined>; adminUser?: unknown };
  } {
    const request: { headers: Record<string, string | undefined>; adminUser?: unknown } = {
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
    const adminAuthService = { resolveAdminFromIdToken: jest.fn() };
    const guard = new AdminAuthGuard(adminAuthService as never);
    const { context } = buildContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(adminAuthService.resolveAdminFromIdToken).not.toHaveBeenCalled();
  });

  it('rejects a non-Bearer Authorization header', async () => {
    const adminAuthService = { resolveAdminFromIdToken: jest.fn() };
    const guard = new AdminAuthGuard(adminAuthService as never);
    const { context } = buildContext({ authorization: 'Basic abc123' });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(adminAuthService.resolveAdminFromIdToken).not.toHaveBeenCalled();
  });

  it('rejects when AdminAuthService cannot resolve the token to an AdminUser', async () => {
    const adminAuthService = {
      resolveAdminFromIdToken: jest.fn().mockRejectedValue(new Error('not an admin')),
    };
    const guard = new AdminAuthGuard(adminAuthService as never);
    const { context } = buildContext({ authorization: 'Bearer some-token' });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('allows the request through and attaches adminUser when resolution succeeds', async () => {
    const admin = { id: 'admin-1', authIdentityRef: 'firebase-admin-1' };
    const adminAuthService = {
      resolveAdminFromIdToken: jest.fn().mockResolvedValue(admin),
    };
    const guard = new AdminAuthGuard(adminAuthService as never);
    const { context, request } = buildContext({ authorization: 'Bearer a-real-token' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(adminAuthService.resolveAdminFromIdToken).toHaveBeenCalledWith('a-real-token');
    expect(request.adminUser).toEqual(admin);
  });
});
