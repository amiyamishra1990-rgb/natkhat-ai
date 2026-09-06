import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Parent } from '@prisma/client';
import { AuthenticatedParentRequest } from './parent-auth.guard';

export type RequestParent = Parent;

/**
 * M27 — reads the `Parent` `ParentAuthGuard` (parent-auth.guard.ts)
 * already attached to the request, the same "guard attaches, decorator
 * reads" split this backend has no prior precedent for at the
 * controller-argument level (`AuditController` reads `req.adminUser`
 * inline instead, since it has only one route) but is standard NestJS
 * practice and keeps `leo-chat.controller.ts`'s three route handlers
 * from each repeating `@Req() request: AuthenticatedParentRequest` and
 * a manual `request.parent` read.
 */
export const CurrentParent = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestParent => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedParentRequest>();
    return request.parent;
  },
);
