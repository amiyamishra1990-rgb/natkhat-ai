import { Module } from '@nestjs/common';
import { IdentityFamilyModule } from '../identity-family/identity-family.module';
import { AuditModule } from '../audit/audit.module';
import { AuthorizationService } from './authorization.service';
import { SessionLifecycleService } from './session-lifecycle.service';

// M15 — Authorization & Session Implementation
// (docs/sprints/sprint-03.md, §4). Depends on IdentityFamilyModule's
// exported repositories (M14) rather than redefining data access —
// this module contains no repository, no Prisma provider of its own.
// AuditModule (M16) is imported for SessionLifecycleService's
// audit-event emission — see that file's constructor comment.
@Module({
  imports: [IdentityFamilyModule, AuditModule],
  providers: [AuthorizationService, SessionLifecycleService],
  exports: [AuthorizationService, SessionLifecycleService],
})
export class AuthorizationModule {}
