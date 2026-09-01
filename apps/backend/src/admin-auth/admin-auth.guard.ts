import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AdminUser } from '@prisma/client';
import { AdminAuthService } from './admin-auth.service';

// M25 (docs/sprints/sprint-05.md, §4; Founder Decision G.2). Extends
// Express's Request rather than using a bare index signature, so
// req.adminUser is typed at every call site that reads it.
export interface AuthenticatedAdminRequest extends Request {
  adminUser: AdminUser;
}

/**
 * The auth guard this milestone exists to add — applied directly to
 * AuditController (`@UseGuards(AdminAuthGuard)`), the one route M25's
 * scope names. Expects `Authorization: Bearer <Firebase ID token>`;
 * any missing/malformed header, invalid token, or a token that
 * verifies but does not resolve to an AdminUser (e.g. a real Parent's
 * token — see admin-auth.service.ts's own comment) is rejected with
 * the same 401, so a caller cannot distinguish "no token" from "token
 * valid but not an admin" — deliberately not leaking which case
 * applies.
 */
@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedAdminRequest>();
    const authHeader = request.headers.authorization;
    const idToken =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice('Bearer '.length)
        : undefined;

    if (!idToken) {
      throw new UnauthorizedException('Missing bearer admin credential');
    }

    try {
      request.adminUser = await this.adminAuthService.resolveAdminFromIdToken(idToken);
    } catch {
      throw new UnauthorizedException('Invalid or unrecognized admin credential');
    }

    return true;
  }
}
