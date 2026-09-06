import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { Parent } from '@prisma/client';
import { FirebaseAuthService } from './firebase-auth.service';

// M27 (docs/sprints/sprint-06.md, §7). Extends Express's Request rather
// than a bare index signature, same convention
// admin-auth/admin-auth.guard.ts's AuthenticatedAdminRequest already
// uses, so req.parent is typed at every call site that reads it.
export interface AuthenticatedParentRequest extends Request {
  parent: Parent;
}

/**
 * M27 — the first parent-facing HTTP auth guard in this backend.
 * `auth/firebase-auth.service.ts` (M15) has always resolved a Firebase
 * ID token to a `Parent` record, but until now nothing called it from
 * an HTTP request — every M15-M22 module was "no controller, no HTTP
 * surface" (leo.module.ts's own comment). `leo-chat.controller.ts` is
 * the first controller that needs a real parent-authenticated
 * principal, so this guard exists to give it one, mirroring
 * `AdminAuthGuard`'s exact shape (`admin-auth/admin-auth.guard.ts`):
 * `Authorization: Bearer <Firebase ID token>`, same generic 401 for
 * "no token," "invalid token," and "token verifies but resolves to no
 * Parent record" — deliberately not leaking which case applies.
 *
 * This resolves *identity* only (which Parent is calling) — it grants
 * no authorization by itself. Every route this guard protects still
 * independently calls `AuthorizationService.authorize(...)` for
 * `interact_with_leo` inside `LeoService` (M23, unchanged), the same
 * "guard proves who, service proves may-they" split
 * `AdminAuthGuard`/`AuditController` already established.
 */
@Injectable()
export class ParentAuthGuard implements CanActivate {
  constructor(private readonly firebaseAuthService: FirebaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedParentRequest>();
    const authHeader = request.headers.authorization;
    const idToken =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice('Bearer '.length)
        : undefined;

    if (!idToken) {
      throw new UnauthorizedException('Missing bearer parent credential');
    }

    try {
      request.parent = await this.firebaseAuthService.resolveParentFromIdToken(idToken);
    } catch {
      throw new UnauthorizedException('Invalid or unrecognized parent credential');
    }

    return true;
  }
}
