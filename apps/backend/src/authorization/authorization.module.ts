import { Module } from '@nestjs/common';
import { IdentityFamilyModule } from '../identity-family/identity-family.module';
import { AuthorizationService } from './authorization.service';
import { SessionLifecycleService } from './session-lifecycle.service';

// M15 — Authorization & Session Implementation
// (docs/sprints/sprint-03.md, §4). Depends on IdentityFamilyModule's
// exported repositories (M14) rather than redefining data access —
// this module contains no repository, no Prisma provider of its own.
@Module({
  imports: [IdentityFamilyModule],
  providers: [AuthorizationService, SessionLifecycleService],
  exports: [AuthorizationService, SessionLifecycleService],
})
export class AuthorizationModule {}
